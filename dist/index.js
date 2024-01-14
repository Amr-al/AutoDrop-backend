"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
Promise.resolve().then(() => __importStar(require("./utils/passport")));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env" });
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const xss_1 = __importDefault(require("xss"));
const compression_1 = __importDefault(require("compression"));
const DBConnection_1 = require("./utils/DBConnection");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const appError_1 = __importDefault(require("./utils/appError"));
const app = (0, express_1.default)();
//Parse json bodies
app.use(express_1.default.json());
//Parse cookies
app.use((0, cookie_parser_1.default)());
//Allow cors for all domains
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
//Session middleware
app.use((0, express_session_1.default)({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
    },
}));
//Initialize passport
app.use(passport_1.default.initialize());
//Use passport session
app.use(passport_1.default.session());
//Use morgan logger in the develpment
app.use((0, morgan_1.default)("dev"));
//Set security http headers
app.use((0, helmet_1.default)());
//Data sanitization against xss attacks
(0, xss_1.default)('<script>alert("xss");</script>');
//Compress all text sent in the response to the client
if (process.env.NODE_ENV === "production") {
    app.use((0, compression_1.default)());
}
(0, DBConnection_1.conect)();
//Global resources
app.use("/api/v1/auth", userRoutes_1.default);
// Handle requests from wrong urls
app.all("*", (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
//Using global error handling middleware
app.use(errorController_1.default);
app.listen(10000, () => {
    console.log(`server is running `);
});
