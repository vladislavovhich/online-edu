import { SignUpDto } from "../../auth/dto/sign-up.dto";
import { PartialClass } from "../../common/helper/partial-type.helper";

export class UpdateUserDto extends PartialClass(SignUpDto) {}