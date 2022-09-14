const { v4:uuid } = require('uuid');
const jimp = require('jimp');

const Category = require('../models/Category');
const User = require('../models/User');
const Ad = require('../models/Ad');

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

    },

    getItem: async (req, res) => {

    },

    editAction: async (req, res) => {
        
    }

};
