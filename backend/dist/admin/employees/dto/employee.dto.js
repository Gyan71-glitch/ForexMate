'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.UpdateEmployeeStatusDto =
  exports.ResetPasswordDto =
  exports.UpdateEmployeeDto =
  exports.CreateEmployeeDto =
    void 0;
const class_validator_1 = require('class-validator');
const client_1 = require('@prisma/client');
class CreateEmployeeDto {
  name;
  phone;
  email;
  role;
  branchId;
  temporaryPassword;
  status;
}
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  CreateEmployeeDto.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  CreateEmployeeDto.prototype,
  'phone',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateEmployeeDto.prototype,
  'email',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsEnum)(client_1.EmployeeRole),
    __metadata('design:type', String),
  ],
  CreateEmployeeDto.prototype,
  'role',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  CreateEmployeeDto.prototype,
  'branchId',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateEmployeeDto.prototype,
  'temporaryPassword',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsEnum)(client_1.EmployeeStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateEmployeeDto.prototype,
  'status',
  void 0,
);
class UpdateEmployeeDto {
  name;
  phone;
  email;
  role;
  branchId;
  status;
}
exports.UpdateEmployeeDto = UpdateEmployeeDto;
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateEmployeeDto.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateEmployeeDto.prototype,
  'phone',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateEmployeeDto.prototype,
  'email',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsEnum)(client_1.EmployeeRole),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateEmployeeDto.prototype,
  'role',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateEmployeeDto.prototype,
  'branchId',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsEnum)(client_1.EmployeeStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateEmployeeDto.prototype,
  'status',
  void 0,
);
class ResetPasswordDto {
  temporaryPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  ResetPasswordDto.prototype,
  'temporaryPassword',
  void 0,
);
class UpdateEmployeeStatusDto {
  status;
}
exports.UpdateEmployeeStatusDto = UpdateEmployeeStatusDto;
__decorate(
  [
    (0, class_validator_1.IsEnum)(client_1.EmployeeStatus),
    __metadata('design:type', String),
  ],
  UpdateEmployeeStatusDto.prototype,
  'status',
  void 0,
);
//# sourceMappingURL=employee.dto.js.map
