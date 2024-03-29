export const DB_NAME = "chat-api";

/**
 * @type {{ GOOGLE: "GOOGLE"; GITHUB: "GITHUB"; EMAIL_PASSWORD: "EMAIL_PASSWORD"}as const}
 */
export const UserLoginType = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
}
export const AvailableSocialLogins = Object.values(UserLoginType);

/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER" } as const}
*/
export const UserRolesEnum ={
    ADMIN: "ADMIN",
    USER: "USER",
}

export const AvailableUserRoles =  Object.values(UserRolesEnum);

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 * A freeze object can no longer be changed
*/
export const ChatEventEnum = Object.freeze({
    // ? once user is ready to go
    CONNECTED_EVENT: "connected",
    // ? when user get disconnected
    DISCONNECT_EVENT: "disconnect",
    // ? when user joins a socket room
    JOIN_CHAT_EVENT: "joinChat",    
    // ? when participant gets removed from group chat or user gets added in the group
    LEAVE_CHAT_EVENT: "leaveChat",
    // ? when admin updates a group name
    UPDATE_GROUP_NAME_EVENT: "updateGroupName",
    // ? when new message is received
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    // ? when there is new one on one chat, new group chat or user gets added in the group
    NEW_CHAT_EVENT: "newChat",
    // ? when there is an error in socket
    SOCKET_ERROR_EVENT: "socketError",
    // ? when participant stops typing
    STOP_TYPING_EVENT: "stopTyping",
    // ? when participant starts typing
    TYPING_EVENT: "typing",
})

export const AvailableChatEvents = Object.values(ChatEventEnum);