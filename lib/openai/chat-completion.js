"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatCompletion = void 0;
const react_1 = __importDefault(require("react"));
const utils_1 = require("./utils");
const react_native_sse_1 = __importDefault(require("react-native-sse"));
class ChatCompletion {
    constructor(api, params, callbacks) {
        this.eventSource = null;
        this.newMessage = '';
        // TODO: handle parallel tool calls
        this.newToolCall = {
            name: '',
            arguments: '',
        };
        this.toolCallResult = null;
        this.toolRenderResult = null;
        this.finished = false;
        this.api = api;
        this.params = params;
        this.callbacks = callbacks;
    }
    // Inits the completion and starts the streaming
    start() {
        // Create a new event source using Completions API
        this.eventSource = new react_native_sse_1.default(`${this.api.basePath}/chat/completions`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.api.apiKey}`,
            },
            // Do not poll, just connect once
            pollingInterval: 0,
            method: 'POST',
            body: this.serializeParams(),
        });
        // Add event listeners
        this.eventSource.addEventListener('message', this.handleNewChunk.bind(this));
        this.eventSource.addEventListener('error', (event) => {
            var _a, _b, _c, _d;
            if (event.type === 'error') {
                console.error('Connection error:', event.message);
                (_b = (_a = this.callbacks).onError) === null || _b === void 0 ? void 0 : _b.call(_a, new Error(event.message));
            }
            else if (event.type === 'exception') {
                console.error('Error:', event.message, event.error);
                (_d = (_c = this.callbacks).onError) === null || _d === void 0 ? void 0 : _d.call(_c, new Error(event.message));
            }
        });
    }
    // Handles a new chunk received
    handleNewChunk(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        // If [DONE], close the connection and mark as done
        if (event.data === '[DONE]') {
            (_a = this.eventSource) === null || _a === void 0 ? void 0 : _a.close();
            return;
        }
        // Handle the case of an empty message
        if (!event.data) {
            console.error('Empty message received.');
            (_c = (_b = this.callbacks).onError) === null || _c === void 0 ? void 0 : _c.call(_b, new Error('Empty message received.'));
            return;
        }
        // Parse the message as a ChatCompletionChunk
        const e = JSON.parse(event.data);
        // Again, handle empty messages
        if (e.choices == null || e.choices.length === 0) {
            return;
        }
        // This library currently only supports one choice
        const firstChoice = e.choices[0];
        // If the model stops because of a tool call, call the tool
        if (firstChoice.finish_reason === 'tool_calls') {
            void this.handleToolCall();
            return;
        }
        // If the model stops, that is it
        if (firstChoice.finish_reason === 'stop') {
            // Call onDone
            (_e = (_d = this.callbacks).onDone) === null || _e === void 0 ? void 0 : _e.call(_d, [
                {
                    content: this.newMessage,
                    role: 'assistant',
                },
            ]);
            // Mark as finished
            this.finished = true;
            return;
        }
        // Handle normal text token delta
        if (firstChoice.delta.content != null) {
            this.newMessage += firstChoice.delta.content;
            this.notifyChunksReceived();
            return;
        }
        // Handle tool calls
        if (firstChoice.delta.tool_calls != null &&
            firstChoice.delta.tool_calls.length > 0) {
            // TODO: OpenAI supports multiple parallel tool calls, this library does not (yet)
            const firstToolCall = firstChoice.delta.tool_calls[0];
            // Append function name if available
            if ((_f = firstToolCall.function) === null || _f === void 0 ? void 0 : _f.name) {
                this.newToolCall.name += firstToolCall.function.name;
            }
            // Append function arguments if available
            if ((_g = firstToolCall.function) === null || _g === void 0 ? void 0 : _g.arguments) {
                this.newToolCall.arguments += firstToolCall.function.arguments;
            }
            return;
        }
        // TODO: maybe handle finish reason `length`
        // This should not happen, but if it does, log it
        console.error('Unknown message received:', event.data);
        (_j = (_h = this.callbacks).onError) === null || _j === void 0 ? void 0 : _j.call(_h, new Error('Unknown message received.'));
    }
    // Serializes all the parameters to JSON for calling the API
    serializeParams() {
        var _a;
        if (this.params.tools == null) {
            return JSON.stringify(this.params);
        }
        const tools = (0, utils_1.toolsToJsonSchema)((_a = this.params.tools) !== null && _a !== void 0 ? _a : {});
        return JSON.stringify(Object.assign(Object.assign({}, this.params), { tools }));
    }
    // Calls all the callbacks with the current messages
    notifyChunksReceived() {
        if (!this.callbacks.onChunkReceived) {
            return;
        }
        const messages = this.getMessages();
        this.callbacks.onChunkReceived(messages);
    }
    // Returns all the messages that have been received so far,
    // including the new message, tool render result and recursive call result
    getMessages() {
        const messages = [];
        if (this.newMessage != null && this.newMessage !== '') {
            messages.push({
                role: 'assistant',
                content: this.newMessage,
            });
        }
        if (this.toolRenderResult != null) {
            messages.push(this.toolRenderResult);
        }
        if (this.toolCallResult != null) {
            messages.push({
                role: 'function',
                name: this.newToolCall.name,
                content: JSON.stringify(this.toolCallResult),
            });
        }
        return messages;
    }
    // Calls the tool and then recursively calls the streaming again
    handleToolCall() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Check if the tool call is valid
            if (this.newToolCall.name === '') {
                console.error('Tool call received without a name.');
                (_b = (_a = this.callbacks).onError) === null || _b === void 0 ? void 0 : _b.call(_a, new Error('Tool call received without a name.'));
                return;
            }
            // Check if the tool is valid
            if (this.params.tools == null ||
                !Object.keys(this.params.tools).includes(this.newToolCall.name)) {
                console.error('Tool call received for unknown tool:', this.newToolCall);
                (_d = (_c = this.callbacks).onError) === null || _d === void 0 ? void 0 : _d.call(_c, new Error('Tool call received for unknown tool.'));
                return;
            }
            // Extract the chosen tool
            const chosenTool = this.params.tools[this.newToolCall.name];
            // Check if the tool is valid
            if (chosenTool == null) {
                console.error('Tool call received for unknown tool:', this.newToolCall);
                (_f = (_e = this.callbacks).onError) === null || _f === void 0 ? void 0 : _f.call(_e, new Error('Tool call received for unknown tool.'));
                return;
            }
            // Parse the arguments
            const args = JSON.parse(this.newToolCall.arguments);
            // Verify that the arguments are valid by parsing them with the zod schema
            try {
                chosenTool.parameters.parse(args);
            }
            catch (e) {
                console.error('Invalid arguments received:', e);
                (_h = (_g = this.callbacks).onError) === null || _h === void 0 ? void 0 : _h.call(_g, new Error('Invalid arguments received.'));
                return;
            }
            // This is either
            // - an async generator (if tool will be fetching data asynchronously)
            // - a component and data (if tool does not need to do any async operations)
            const generatorOrData = chosenTool.render(args);
            if ((0, utils_1.isAsyncGeneratorFunction)(generatorOrData)) {
                // Call the tool and iterate over results
                // Use while to access the last value of the generator (what it returns too rather then only what it yields)
                // Only the last returned/yielded value is the one we use
                const generator = generatorOrData;
                let next = null;
                while (next == null || !next.done) {
                    // Fetch the next value
                    next = yield generator.next();
                    const value = next.value;
                    // If the value is contains data and component, save both
                    if (value != null &&
                        Object.keys(value).includes('data') &&
                        Object.keys(value).includes('component')) {
                        const v = value;
                        this.toolRenderResult = v.component;
                        this.toolCallResult = v.data;
                    }
                    else if (react_1.default.isValidElement(value)) {
                        this.toolRenderResult = value;
                    }
                    // Update the parent by calling the callbacks
                    this.notifyChunksReceived();
                    // Break if the generator is done
                    if (next.done) {
                        break;
                    }
                }
            }
            else {
                // Not a generator, simply call the render function, we received all the data at once.
                const data = generatorOrData;
                this.toolRenderResult = data.component;
                this.toolCallResult = data.data;
                // Update the parent by calling the callbacks
                this.notifyChunksReceived();
            }
            // Call recursive streaming
            yield this.streamRecursiveAfterToolCall();
            this.finished = true;
        });
    }
    streamRecursiveAfterToolCall() {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new completion and stream up messages from this one and any from the recursive ones
            const newCompletion = new ChatCompletion(this.api, Object.assign(Object.assign({}, this.params), { messages: [
                    ...this.params.messages, // Messages from this completion
                    ...(0, utils_1.filterOutReactComponents)(this.getMessages()), // Messages from the recursive completion
                ] }), Object.assign(Object.assign({}, this.callbacks), { onChunkReceived: (messages) => {
                    var _a, _b;
                    (_b = (_a = this.callbacks).onChunkReceived) === null || _b === void 0 ? void 0 : _b.call(_a, [
                        ...this.getMessages(), // Prepend messages from this completion
                        ...messages,
                    ]);
                }, onDone: (messages) => {
                    var _a, _b;
                    // Compile all messages from this completion and the recursive one
                    (_b = (_a = this.callbacks).onDone) === null || _b === void 0 ? void 0 : _b.call(_a, [...this.getMessages(), ...messages]);
                } }));
            // Start the new completion
            newCompletion.start();
            // Wait until the new completion is finished
            while (!newCompletion.finished) {
                yield (0, utils_1.sleep)(100);
            }
        });
    }
}
exports.ChatCompletion = ChatCompletion;
