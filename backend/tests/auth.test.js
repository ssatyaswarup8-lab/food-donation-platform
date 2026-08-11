require("./setup");
process.env.JWT_SECRET = "test_secret";
process.env.JWT_EXPIRE = "1d";

const request = require("supertest");
const app = require("../app");

describe("Auth Endpoints", () => {
  const validDonor = {
    name: "Test Restaurant",
    email: "donor@test.com",
    password: "password123",
    phone: "9876543210",
    role: "donor",
    donorType: "restaurant",
    address: "Test Address",
    longitude: 85.8,
    latitude: 20.3,
  };

  test("should register a new donor successfully", async () => {
    const res = await request(app).post("/api/auth/register").send(validDonor);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.role).toBe("donor");
  });

  test("should reject registration with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validDonor, email: "not-an-email" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should reject self-registration as admin", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validDonor, email: "fake-admin@test.com", role: "admin" });

    expect(res.statusCode).toBe(400); // caught by validator (role not in allowed enum)
  });

  test("should login with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(validDonor);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validDonor.email, password: validDonor.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  });

  test("should reject login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(validDonor);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validDonor.email, password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
  });

  test("should not allow duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(validDonor);
    const res = await request(app).post("/api/auth/register").send(validDonor);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});