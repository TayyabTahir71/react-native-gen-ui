"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterOutReactComponents = filterOutReactComponents;
exports.sleep = sleep;
exports.toolsToJsonSchema = toolsToJsonSchema;
exports.isReactElement = isReactElement;
exports.isAsyncGeneratorFunction = isAsyncGeneratorFunction;
const react_1 = __importDefault(require("react"));
const zod_to_json_schema_1 = __importDefault(require("zod-to-json-schema"));
// Filter out React components from a list of messages
function filterOutReactComponents(messages) {
    return messages.filter((m) => !react_1.default.isValidElement(m));
}
// Waits a specified number of milliseconds
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// Convert a tools object to a JSON schema
function toolsToJsonSchema(tools) {
    const result = [];
    for (const [key, value] of Object.entries(tools)) {
        result.push({
            type: 'function',
            function: {
                name: key,
                description: value.description,
                parameters: (0, zod_to_json_schema_1.default)(value.parameters),
            },
        });
    }
    return result;
}
function isReactElement(message) {
    return react_1.default.isValidElement(message);
}
function isAsyncGeneratorFunction(fn) {
    var _a;
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator
    return ((_a = fn === null || fn === void 0 ? void 0 : fn.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'AsyncGenerator';
}
