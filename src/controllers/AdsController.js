const { v4:uuid } = require('uuid');
const jimp = require('jimp');

const Category = require('../models/Category');
const User = require('../models/User');
const Ad = require('../models/Ad');
const State = require('../models/State');

const addImage = async (buffer) => {
    let newName = `${uuid()}.jpg`;
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;
};

module.exports = {

    getCategories: async (req, res) => {
        const cats = await Category.find();

        let categories = [];

        for(let i in cats) {
            
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({ categories });
    },

    addAction: async (req, res) => {
        
        let { title, price, priceNeg, desc, cat, token } = req.body;
        const user = await User.findOne({ token }).exec();

        if(!title || !cat) {
            res.json({ error: 'Título e/ou categoria não foram preenchidos' });
            return;
        }

        if(cat) {
            const c = await Category.findOne({ slug: cat }).exec();
            if(c) {
                cat = c._id.toString();
            }
        }

        if(price) {
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '');
            price = parseFloat(price);
        } else {
            price = 0;
        }

        const newAd = new Ad();
        newAd.status = true;
        newAd.idUser = user._id;
        newAd.state = user.state;
        newAd.dateCreated = new Date();
        newAd.title = title;
        newAd.category = cat;
        newAd.price = price;
        newAd.priceNegotiable = (priceNeg == 'true') ? true : false;
        newAd.description = desc;
        newAd.views = 0;

        if(req.files && req.files.img) {
            // Se for igual a undefined é pq é um objeto e não um array e então só tenho uma imagem
            // Se tiver um valor é pq é um array e então mandei várias imagens
            if(req.files.img.length == undefined) {
                if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data);
                        newAd.images.push({
                            url,
                            default: false
                        });
                }
            } else {
                for(let i = 0; i < req.files.img.length > 0; i++) {
                    if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                        let url = await addImage(req.files.img[i].data);
                            newAd.images.push({
                                url,
                                default: false
                            });
                    }
                }
            }
            if(newAd.images.length > 0) {
                newAd.images[0].default = true;
            }
        }

        const info = await newAd.save();
        
        res.json({ id: info._id });
    },

    getList: async (req, res) => {
        let { sort = 'asc', offset = 0, limit = 8, search, cat, state } = req.query;
        let total = 0;

        let filters = { status: true };

        if(search) {
            filters.title = { '$regex': search, '$options': 'i' };
        }

        if(cat) {
            const c = await Category.findOne({ slug: cat }).exec();
            if(c) {
                filters.category = c._id.toString();
            }
        }

        if(state) {
            const st = await State.findOne({ name: state.toUpperCase() }).exec();
            if(st) {
                filters.state = st._id.toString();
            }
        }

        const adsTotal = await Ad.find(filters).exec();
        total = adsTotal.length;

        const adsData = await Ad.find(filters)
            .sort({ dateCreated: (sort == 'desc'?-1:1) })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec();

        let ads = [];

        for(let i in adsData) {
            let image;

            let defaultImg = await adsData[i].images.find(e => e.default);
            if(defaultImg) {
                image = `${process.env.BASE}/media/${defaultImg.url}`;
            } else {
                image = `${process.env.BASE}/media/default.jpg`;
            }

            ads.push({
                id: adsData[i]._id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image
            });
        }

        res.json({ ads, total });

    },

    getItem: async (req, res) => {
        let { id, other = null } = req.query;

        if(!id) {
            res.json({ error: 'Id do produto é obrigatório' });
            return;
        }
        
        if(id.length <= 12) {
            res.json({ error: 'Não é um id válido' });
            return;
        }

        const ad = await Ad.findById(id).exec();
        if(!ad) {
            res.json({ error: 'Produto não encontrado.' });
            return;
        }

        ad.views++;
        ad.save();

        let images = [];
        for(let i in ad.images) {
            images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
        }

        let category = await Category.findById(ad.category).exec();
        let userInfo = await User.findById(ad.idUser).exec();
        let stateInfo = await State.findById(ad.state).exec();

        let others = [];
        if(other) {
            const otherData = await Ad.find({ status: true, idUser: ad.idUser }).exec();

            for(let i in otherData) {
                if(otherData[i]._id.toString() != ad._id.toString()) {
                    let image = `${process.env.BASE}/media/default.jpg`;

                    let defaultImg = otherData[i].images.find(e => e.default);
                    if(defaultImg) {
                        image = `${process.env.BASE}/media/${defaultImg.url}`;
                    }

                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        priceNegotiable: otherData[i].priceNegotiable,
                        image
                    });
                }
            }
        }

        res.json({
            id: ad.id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images,
            category,
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            state: stateInfo.name,
            others

        });
    },

    editAction: async (req, res) => {
        
    }

};
