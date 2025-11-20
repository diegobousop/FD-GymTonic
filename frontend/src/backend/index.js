import { init } from "./appFetch";
import * as userService from "./userService";
import * as routineService from "./routineService";
import * as exerciseService from "./exerciseService";
import * as imageService from "./imageService";
import * as notificationService from "./notificationService";
import * as searchService from "./searchService";
import NetworkError from "./NetworkError";

export { default as NetworkError } from "./NetworkError";

const backend = { init, userService, routineService, exerciseService, imageService, notificationService, searchService };

export default backend;
