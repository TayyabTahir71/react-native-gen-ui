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
    const [isStopped, setIsStopped] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (initialMessages) {
            // Set initial messages on mount if provided
            setMessages(initialMessages);
        }
    }, []);
    const setConversation = (conversation) => {
        setMessages([...(initialMessages || []), ...conversation]);
    };
    const handleSubmit = (msg) => __awaiter(void 0, void 0, void 0, function* () {
        // Called on user message submission
        // Start loading
        setIsStopped(false);
        setIsLoading(true);
        // Clear input on submit
        setInput('');
        const updatedMessages = [
            ...messages,
            { content: msg, role: 'user' },
            { content: 'Loading', role: 'assistant', isLoading: true },
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
                let newMsg;
                if (Array.isArray(newMessages)) {
                    // If newMessages is an array, extract the first element or flatten if needed
                    newMsg = newMessages[0];
                }
                else {
                    // If newMessages is already an object, use it as is
                    newMsg = newMessages;
                }
                // Update the last message in updatedMessages or append a new one
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    if (updatedMessages.length > 0) {
                        // Update the last message content
                        updatedMessages[updatedMessages.length - 1] = Object.assign(Object.assign({}, updatedMessages[updatedMessages.length - 1]), newMsg);
                    }
                    else {
                        // If no messages exist, add the new message
                        updatedMessages.push(newMsg);
                    }
                    return updatedMessages;
                });
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
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(messages);
            },
        });
    });
    const handleStop = () => {
        console.log('stop');
        setIsStopped(true);
        setIsStreaming(false);
        setIsLoading(false);
    };
    return {
        handleStop,
        setConversation,
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
