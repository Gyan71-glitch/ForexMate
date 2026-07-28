import { Test, TestingModule } from '@nestjs/testing';
import { OpsService } from './ops.service';

describe('OpsService', () => {
  let service: OpsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpsService],
    }).compile();

    service = module.get<OpsService>(OpsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
