import { PickClass } from "../../common/helper/pick-type.helper";
import { SignUpDto } from "./sign-up.dto";

export class SignInDto extends PickClass(SignUpDto, ['email', 'password']) {}