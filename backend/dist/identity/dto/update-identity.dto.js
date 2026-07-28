"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIdentityDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_identity_dto_1 = require("./create-identity.dto");
class UpdateIdentityDto extends (0, swagger_1.PartialType)(create_identity_dto_1.CreateIdentityDto) {
}
exports.UpdateIdentityDto = UpdateIdentityDto;
//# sourceMappingURL=update-identity.dto.js.map