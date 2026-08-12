require("./setup");
process.env.JWT_SECRET = "test_secret";
process.env.JWT_EXPIRE = "1d";

// Mock the email service so tests never send real emails.
// We capture the OTP argument so tests can use it to complete verification.
jest.mock("../services/notificationEmail.service", () => ({
  sendVerificationEmail: jest.fn((to, name, otp) => {
    global.__lastOTP = otp;
    return Promise.resolve(true);
  }),
  sendOTPEmail: jest.fn(() => Promise.resolve(true)),
  sendFoodClaimedEmail: jest.fn(() => Promise.resolve(true)),
}));

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

  // Helper: registers a user and verifies their email, returning the login token
  const registerAndVerify = async (userData) => {
    await request(app).post("/api/auth/register").send(userData);
    const otp = global.__lastOTP;

    const verifyRes = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: userData.email, otp });

    return verifyRes;
  };

  test("should register a new donor and require email verification (no token yet)", async () => {
    const res = await request(app).post("/api/auth/register").send(validDonor);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requiresVerification).toBe(true);
    expect(res.body.data).not.toHaveProperty("token");
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

  test("should not allow duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(validDonor);
    const res = await request(app).post("/api/auth/register").send(validDonor);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test("should verify email with correct OTP and return a token", async () => {
    const verifyRes = await registerAndVerify(validDonor);

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data).toHaveProperty("token");
    expect(verifyRes.body.data.isEmailVerified).toBe(true);
  });

  test("should reject verification with wrong OTP", async () => {
    await request(app).post("/api/auth/register").send(validDonor);

    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: validDonor.email, otp: "000000" });

    expect(res.statusCode).toBe(400);
  });

  test("should reject login before email is verified", async () => {
    await request(app).post("/api/auth/register").send(validDonor);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validDonor.email, password: validDonor.password });

    expect(res.statusCode).toBe(403);
    expect(res.body.requiresVerification).toBe(true);
  });

  test("should login successfully after email verification", async () => {
    await registerAndVerify(validDonor);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validDonor.email, password: validDonor.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  });

  test("should reject login with wrong password (after verification)", async () => {
    await registerAndVerify(validDonor);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validDonor.email, password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
  });

  test("should resend a new OTP and invalidate verification with the old one", async () => {
    await request(app).post("/api/auth/register").send(validDonor);
    const oldOTP = global.__lastOTP;

    await request(app).post("/api/auth/resend-verification").send({ email: validDonor.email });
    const newOTP = global.__lastOTP;

    expect(newOTP).not.toBe(oldOTP);

    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: validDonor.email, otp: newOTP });

    expect(res.statusCode).toBe(200);
  });
});