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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChat = void 0;
const react_1 = require("react");
const utils_1 = require("../openai/utils");
// Hook that handles chat logic for user chat conversation
const useChat = ({ openAi, initialMessages, onSuccess, onError, tools, }) => {
    const [input, setInput] = (0, react_1.useState)('');
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)();
    /* Loading states */
    // True as soon as user submits a message
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    // True while streaming response
    const [isStreaming, setIsStreaming] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (initialMessages) {
            // Set initial messages on mount if provided
            setMessages(initialMessages);
        }
    }, []);
    const handleSubmit = (msg) => __awaiter(void 0, void 0, void 0, function* () {
        // Called on user message submission
        // Start loading
        setIsLoading(true);
        // Clear input on submit
        setInput('');
        const updatedMessages = [
            ...messages,
            {
                // Append user submitted message to current messages
                content: msg,
                role: 'user',
            },
            {
                // Add a loading message for assistant
                content: 'Loading...',
                role: 'assistant',
                isLoading: true, // Add custom flag to track loading message
            },
        ];
        // Also update all messages with new user message
        setMessages(updatedMessages);
        // Call to OpenAI API to get response
        yield openAi.createChatCompletion({
            messages: (0, utils_1.filterOutReactComponents)(updatedMessages),
            tools: tools,
        }, {
            onChunkReceived: (newMessages) => {
                // Streaming started - update streaming state
                setIsStreaming(true);
                // Update messages with streamed message
                setMessages([...updatedMessages, ...newMessages]);
            },
            onError: (error) => {
                // Reset loading and streaming states
                setIsStreaming(false);
                setIsLoading(false);
                // Error while streaming
                setError(error);
                // Call onError callback (if provided)
                onError === null || onError === void 0 ? void 0 : onError(error);
            },
            onDone: (messages) => {
                // Reset loading and streaming states
                setIsStreaming(false);
                setIsLoading(false);
                // Streaming done - call onSuccess callback
                const finalMessages = updatedMessages.filter((msg) => !msg.isLoading);
                setMessages([...finalMessages, ...messages]);
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(messages);
            },
        });
    });
    return {
        setMessages,
        messages,
        input,
        isLoading,
        isStreaming,
        error,
        onInputChange: setInput,
        handleSubmit,
    };
};
exports.useChat = useChat;
