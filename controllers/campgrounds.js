const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    try {
        const geoData = await maptilerClient.geocoding.forward(
            req.body.campground.location,
            { limit: 1 }
        );
        if (!geoData || !geoData.features || geoData.features.length === 0) {
            req.flash("error", "Can not find that location!");
            return res.redirect(`/campgrounds/new`);
        }
        const campground = await new Campground(req.body.campground);
        campground.geometry = geoData.features[0].geometry;
        campground.images = req.files.map((f) => ({
            url: f.path,
            filename: f.filename,
        }));
        campground.author = req.user._id;
        await campground.save();
        req.flash("success", "Successfully made a new campground!");
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        console.err("Error creating campground:", err);
        req.flash("error", "Failed to create campground");
        res.redirect(`/campgrounds/new`);
    }
};

module.exports.showCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("author");
    if (!campground) {
        req.flash("error", "Can not find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Can not find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }
    req.flash("success", "successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};
