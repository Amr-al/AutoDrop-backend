const router = require("express").Router();
const { signUp, signIn, editProfile } = require("../controllers/userController");
const validation = require('../assits/validation')
const upload = require('../assits/multer')

router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch('/edit', validation.validation , upload.single('file'), editProfile)

module.exports = router;
