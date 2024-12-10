"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIApi = void 0;
const constants_1 = require("./constants");
const chat_completion_1 = require("./chat-completion");
class OpenAIApi {
    constructor({ apiKey, basePath }) {
        this.apiKey = apiKey;
        this.basePath = basePath !== null && basePath !== void 0 ? basePath : constants_1.OPENAI_BASE_PATH;
    }
    createChatCompletion(params, callbacks) {
        return new Promise((resolve) => {
            const cc = new chat_completion_1.ChatCompletion(this, params, callbacks);
            cc.start();
            resolve(cc);
        });
    }
}
exports.OpenAIApi = OpenAIApi;
