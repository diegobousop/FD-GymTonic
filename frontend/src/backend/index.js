import { init } from "./appFetch";
import * as userService from "./userService";
import * as routineService from "./routineService";
import * as exerciseService from "./exerciseService";
import * as imageService from "./imageService";
import * as notificationService from "./notificationService";
import * as searchService from "./searchService";

export { default as NetworkError } from "./NetworkError";

export default { init, userService, routineService, exerciseService, imageService, notificationService, searchService };
