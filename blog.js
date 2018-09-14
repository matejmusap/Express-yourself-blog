var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride  = require("method-override"),
    port             = process.env.PORT || 3000;
    
mongoose.set("debug", true);
mongoose.connect("mongodb://localhost/expressyourself", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema ({
    title: String,
    image: String,
    author: String,
    content: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res) {
    res.redirect("/blogs");
});

app.get("/blogs/about", function(req, res) {
    res.render("about");
});

app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, allBlogs) {
        if(err) {
            console.log(err);
        } else {
            res.render("index", {blogs: allBlogs}); 
        }
    });
});

app.get("/blogs/new", function(req, res) {
    res.render("new");
});

app.post("/blogs", function(req, res) {
    req.body.blog.content = req.sanitize(req.body.blog.content);
    Blog.create(req.body.blog, function(err, newBlog) {
        if(err) {
            console.log(err || newBlog);
        } else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err || !foundBlog) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, updateBlog) {
        if(err || !updateBlog) {
            console.log(err);
            res.redirect("/blogs");
        } else {
           res.render("edit", {blog: updateBlog});
        }
    });
});

app.put("/blogs/:id", function(req, res) {
    req.body.blog.content= req.sanitize(req.body.blog.content);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if(err) {
            console.log(err);
        } else {
          res.redirect("/blogs/" + req.params.id);
        }
    }); 
});


app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/blogs");
        }
    });
});



app.listen(port, function() {
    console.log("Server has started at " + port);
});