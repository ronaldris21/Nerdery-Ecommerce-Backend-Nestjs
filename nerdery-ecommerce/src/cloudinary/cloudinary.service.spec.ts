import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';

import { CloudinaryService } from './cloudinary.service';

const mockStreamifier = {
  createReadStream: jest.fn(),
};

jest.mock('streamifier', () => {
  return jest.fn().mockImplementation(() => mockStreamifier);
});

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should upload a file successfully', async () => {
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mockResult = { secure_url: 'http://example.com/image.jpg' };

    const uploadStreamMock = jest.fn((options, callback) => {
      callback(null, mockResult);
    });
    // cloudinary.uploader.upload_stream = uploadStreamMock;
    jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(uploadStreamMock as any);

    const result = await service.uploadFile(mockFile);

    expect(result).toEqual(mockResult);
    expect(uploadStreamMock).toHaveBeenCalled();
  }, 10000);

  it('should throw an exception while uploading a file if any cloudinary error', async () => {
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mockError = new Error('Upload error');
    const uploadStreamMock = jest.fn((options, callback) => {
      callback(mockError, null);
    });
    jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(uploadStreamMock as any);

    await expect(service.uploadFile(mockFile)).rejects.toThrow();

    expect(uploadStreamMock).toHaveBeenCalled();
  }, 10000);
});
