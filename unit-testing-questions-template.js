import test from 'tape';

// For each unit test you write,
// answer these questions:
test('What component aspect are you testing?', assert => {
  const actual = 'What is the actual output?';
  const expected = 'What is the expected output?';

  assert.equal(actual, expected,
    'What should the feature do?');

  assert.end();
});


// SOME NOTE:
// TEST WITH jest.spyOn
it('should return a user by ID', async () => {
  const userId = 'a23f8b0e-2aaa-4abe-bd5f-9cf80a87d6d4';
  const expectedUser: User = {
    id: userId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password',
    createdAt: new Date(),
  };
  jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(expectedUser);

  const result = await service.findById(userId);
  expect(result).toEqual(expectedUser);
  expect(prismaService.user.findUnique).toHaveBeenCalledWith({
    where: { id: userId },
  });
});

//Test with mock resolved value
it('should find keys by pattern and delete them', async () => {
  const pattern = 'user:e3bb2540-725c-4d66-98ec-39a32ef4e457:iat:*';
  const keys = ['test1', 'test2'];
  mockRedisClient.keys.mockResolvedValue(keys);
  mockRedisClient.del.mockResolvedValue(2);

  await redisService.removeAllKeysByPattern(pattern);

  expect(mockRedisClient.keys).toHaveBeenLastCalledWith(pattern);
  expect(mockRedisClient.del).toHaveBeenLastCalledWith(...keys);
});

// toBeInstanceOf
it('pokemon ID less than 1 should throw error', async () => {
  const getPokemon = pokemonService.getPokemon(0);
  await expect(getPokemon).rejects.toBeInstanceOf(BadRequestException);
});


// LOGGER MOCK

// let service: MyService;
// let repository: MyRepository;
// let logger: Logger;

// beforeEach(async () => {
//   const module: TestingModule = await Test.createTestingModule({
//     providers: [
//       MyService,
//       { provide: MyRepository, useValue: createMock<MyRepository>() },
//     ],
//   }).compile();

//   service = module.get<ProductsService>(ProductsService);
//   repository = module.get(BrandRepository);
//   logger = service['logger'] = createMock<Logger>();
// });