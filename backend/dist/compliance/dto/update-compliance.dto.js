"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateComplianceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_compliance_dto_1 = require("./create-compliance.dto");
class UpdateComplianceDto extends (0, swagger_1.PartialType)(create_compliance_dto_1.CreateComplianceDto) {
}
exports.UpdateComplianceDto = UpdateComplianceDto;
//# sourceMappingURL=update-compliance.dto.js.map