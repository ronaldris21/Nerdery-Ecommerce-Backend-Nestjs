import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VariationImage } from '@prisma/client';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { validUUID3, validUUID6 } from 'src/common/testing-mocks/helper-data';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { CloudinaryService } from '../../common/modules/cloudinary/cloudinary.service';

import { ImagesService } from './images.service';

const mockPrismaService = {
  variationImage: {
    create: jest.fn(),
  },
};

describe('ImagesService', () => {
  let service: ImagesService;
  let prismaService: typeof mockPrismaService;
  let cloudinaryService: DeepMocked<CloudinaryService>;
  let idValidatorService: DeepMocked<IdValidatorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: CloudinaryService,
          useValue: createMock<CloudinaryService>(),
        },
        {
          provide: IdValidatorService,
          useValue: createMock<IdValidatorService>(),
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    prismaService = module.get(PrismaService);
    cloudinaryService = module.get(CloudinaryService);
    idValidatorService = module.get(IdValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(cloudinaryService).toBeDefined();
    expect(idValidatorService).toBeDefined();
  });

  describe('uploadFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const productVariationId = validUUID3;
    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'test-image.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from(
        'askjndalmdñlasasdhgkcajkmaSJKNCAJSLKDCKCDKNdlamklñadjfcjsnfkmlcs,sdlkckma',
      ),
      size: 1024,
    } as any;
    const mockCloudinaryResult = {
      secure_url:
        'https://res.cloudinary.com/dg3hzpfti/image/upload/v1736163757/k48pzhk1gapb5duzvjmf.png',
    };
    const mockVariationImage: VariationImage = {
      id: validUUID6,
      productVariationId: productVariationId,
      imageUrl: mockCloudinaryResult.secure_url,
    };

    it('should upload an image successfully', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue({
        id: productVariationId,
      } as any);
      cloudinaryService.uploadFile.mockResolvedValue(mockCloudinaryResult as any);
      prismaService.variationImage.create.mockResolvedValue(mockVariationImage);

      const result = await service.uploadFile(productVariationId, mockFile);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        false,
        false,
      );
      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(prismaService.variationImage.create).toHaveBeenCalledWith({
        data: {
          productVariationId: productVariationId,
          imageUrl: mockCloudinaryResult.secure_url,
        },
      });

      expect(result).toEqual(mockVariationImage);
    });

    it('should throw UnprocessableEntityException if file is not an image', async () => {
      const nonImageFile: Express.Multer.File = {
        ...mockFile,
        mimetype: 'application/pdf',
      };

      await expect(service.uploadFile(productVariationId, nonImageFile)).rejects.toThrow(
        UnprocessableEntityException,
      );

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalled();
      expect(cloudinaryService.uploadFile).not.toHaveBeenCalled();
      expect(prismaService.variationImage.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if product variation does not exist', async () => {
      idValidatorService.findUniqueProductVariationById.mockRejectedValue(
        new NotFoundException('Product variation not found'),
      );

      await expect(service.uploadFile(productVariationId, mockFile)).rejects.toThrow(
        NotFoundException,
      );

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        false,
        false,
      );
      expect(cloudinaryService.uploadFile).not.toHaveBeenCalled();
      expect(prismaService.variationImage.create).not.toHaveBeenCalled();
    });

    it('should handle Cloudinary upload errors', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue({
        id: productVariationId,
      } as any);
      cloudinaryService.uploadFile.mockRejectedValue(new Error('Cloudinary upload failed'));

      await expect(service.uploadFile(productVariationId, mockFile)).rejects.toThrow(
        'Cloudinary upload failed',
      );

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        false,
        false,
      );
      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(prismaService.variationImage.create).not.toHaveBeenCalled();
    });

    it('should handle database create errors', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue({
        id: productVariationId,
      } as any);
      cloudinaryService.uploadFile.mockResolvedValue(mockCloudinaryResult as any);
      prismaService.variationImage.create.mockRejectedValue(new Error('Database create failed'));

      await expect(service.uploadFile(productVariationId, mockFile)).rejects.toThrow();

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        false,
        false,
      );
      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(prismaService.variationImage.create).toHaveBeenCalledWith({
        data: {
          productVariationId: productVariationId,
          imageUrl: mockCloudinaryResult.secure_url,
        },
      });
    });
  });
});
