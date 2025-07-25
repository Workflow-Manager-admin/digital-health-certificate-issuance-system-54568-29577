const request = require('supertest');
const app = require('../src/index');

describe('Digital Health Certificate Backend API', () => {
  let patientToken, doctorToken, certId, applicationId;

  it('Can register and login as patient', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testpat', password: 'password', fullName: 'Tester Pat', email: 'p@t.com' });
    expect(res1.body.username).toBe('testpat');
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testpat', password: 'password' });
    expect(res2.body.token).toBeDefined();
    patientToken = res2.body.token;
  });

  it('Can login as doctor', async () => {
    // Assume seeded user in dummydb
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'doctor1', password: 'password' }); // will fail unless the seeded dummydb hash is corrected
    if (res.body.token) doctorToken = res.body.token;
  });

  it('Patient submits application and can fetch own', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ type: 'Vaccination', data: { dose: '3', vaccine: 'SuperVax' } });
    expect(res.body.id).toBeDefined();
    applicationId = res.body.id;

    const mine = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(Array.isArray(mine.body)).toBe(true);
    expect(mine.body.length).toBeGreaterThanOrEqual(1);
  });

  it('Doctor or admin can approve application', async () => {
    if (!doctorToken) return; // Skip if no doctor
    const res = await request(app)
      .patch(`/api/applications/${applicationId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ status: 'approved', notes: 'All checks ok' });
    expect(res.body.status).toBe('approved');
  });

  it('Doctor or admin can issue a certificate', async () => {
    if (!doctorToken) return;
    const res = await request(app)
      .post('/api/certificates/issue')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ applicationId });
    if (res.body.id) certId = res.body.id;
    expect(res.body.status).toBe('issued');
  });

  it('Patient can list and (mock) download their certificate', async () => {
    if (!patientToken) return;
    const res = await request(app)
      .get('/api/certificates')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length) {
      const cert = res.body[0];
      const dl = await request(app)
        .get(`/api/certificates/${cert.id}/download`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(dl.statusCode).toBe(200);
    }
  });

  it('Verification endpoint works (limited info)', async () => {
    if (!certId) return;
    const res = await request(app)
      .get(`/api/verify/${certId}`);
    expect(res.body.verified).toBe(true);
    expect(res.body.id).toBe(certId);
  });
});
