import { PickClass } from "../../common/helper/pick-type.helper";
import { SignUpDto } from "../../auth/dto/sign-up.dto";

export class CreateUserDto extends SignUpDto{
    token: string
}