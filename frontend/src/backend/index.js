import { init } from "./appFetch";
import * as userService from "./userService";
import * as routineService from "./routineService";
import * as exerciseService from "./exerciseService";


export { default as NetworkError } from "./NetworkError";

export default { init, userService, routineService, exerciseService };
