import { PaginationResponseDto } from "../../common/dto/pagination-res.dto";
import { GetMessageDto } from "./get-message.dto";

export class GetMessagesDto extends PaginationResponseDto<GetMessageDto>{}