const router = require("express").Router();
const { signUp, signIn, editProfile, sendForgetMail,forgetPassword } = require("../controllers/userController");
const validation = require('../assits/validation')
const upload = require('../assits/multer')

router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch('/edit', validation.validation , upload.single('file'), editProfile)
router.post('/sendmail', sendForgetMail)
router.patch('/forgetpassword',forgetPassword)

module.exports = router;
