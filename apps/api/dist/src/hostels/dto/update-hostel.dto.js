"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHostelDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_hostel_dto_1 = require("./create-hostel.dto");
class UpdateHostelDto extends (0, mapped_types_1.PartialType)(create_hostel_dto_1.CreateHostelDto) {
}
exports.UpdateHostelDto = UpdateHostelDto;
//# sourceMappingURL=update-hostel.dto.js.map