import { init } from "./appFetch";
import * as userService from "./userService";
import * as routineService from "./routineService";

export { default as NetworkError } from "./NetworkError";

export default { init, userService, routineService };
