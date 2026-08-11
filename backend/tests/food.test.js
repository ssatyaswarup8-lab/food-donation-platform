require("./setup");
process.env.JWT_SECRET = "test_secret";
process.env.JWT_EXPIRE = "1d";

const request = require("supertest");
const app = require("../app");

describe("Food Endpoints", () => {
  let donorToken;

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Hotel",
      email: "hotel@test.com",
      password: "password123",
      phone: "9876543210",
      role: "donor",
      donorType: "hotel",
      address: "Test Address",
      longitude: 85.8,
      latitude: 20.3,
    });
    donorToken = res.body.data.token;
  });

  test("should reject food creation without auth token", async () => {
    const res = await request(app).post("/api/foods").send({ foodName: "Rice" });
    expect(res.statusCode).toBe(401);
  });

  test("should reject food creation with missing required fields", async () => {
    const res = await request(app)
      .post("/api/foods")
      .set("Authorization", `Bearer ${donorToken}`)
      .field("foodName", "Veg Biryani");

    expect(res.statusCode).toBe(400);
  });

  test("should create a food listing with valid data", async () => {
    const res = await request(app)
      .post("/api/foods")
      .set("Authorization", `Bearer ${donorToken}`)
      .field("foodName", "Veg Biryani")
      .field("quantity", "50")
      .field("quantityUnit", "plates")
      .field("foodType", "veg")
      .field("preparedAt", new Date().toISOString())
      .field("expiresAt", new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString())
      .field("pickupAddress", "Bhubaneswar")
      .field("longitude", "85.8245")
      .field("latitude", "20.2961");

    expect(res.statusCode).toBe(201);
    expect(res.body.data.foodName).toBe("Veg Biryani");
    expect(res.body.data.status).toBe("available");
  });

  test("should reject expiry time before prepared time", async () => {
    const res = await request(app)
      .post("/api/foods")
      .set("Authorization", `Bearer ${donorToken}`)
      .field("foodName", "Veg Biryani")
      .field("quantity", "50")
      .field("foodType", "veg")
      .field("preparedAt", new Date().toISOString())
      .field("expiresAt", new Date(Date.now() - 1000).toISOString())
      .field("pickupAddress", "Bhubaneswar")
      .field("longitude", "85.8245")
      .field("latitude", "20.2961");

    expect(res.statusCode).toBe(400);
  });
});