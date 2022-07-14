
exports.getAddProduct = (req, res, next) => {
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    isAuthenticated: req.session.isLoggedIn
  });
};

// exports.postAddProduct = (req, res, next) => {
//   const product = new Product(req.body.title)
//   product.save()
//   res.redirect('/')
// }
