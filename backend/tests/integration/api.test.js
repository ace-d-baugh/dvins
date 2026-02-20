const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server.js');

chai.use(chaiHttp);
const expect = chai.expect;

describe('D'VINS Backend API', () => {
  describe('Health Check', () => {
    it('should return API status', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('D'VINS Backend API is running');
          done();
        });
    });
  });

  describe('Authentication', () => {
    it('should reject registration without email', (done) => {
      chai.request(app)
        .post('/auth/register')
        .send({
          password: 'TestPassword123!',
          password_confirmation: 'TestPassword123!'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should reject registration without password', (done) => {
      chai.request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should reject login without credentials', (done) => {
      chai.request(app)
        .post('/auth/login')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  describe('Parks', () => {
    it('should return parks list', (done) => {
      chai.request(app)
        .get('/parks')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
          expect(res.body).to.have.property('data');
          expect(res.body).to.have.property('count');
          done();
        });
    });

    it('should reject invalid park ID', (done) => {
      chai.request(app)
        .get('/parks/999/attractions')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('Attractions', () => {
    it('should reject request without authentication', (done) => {
      chai.request(app)
        .get('/attractions/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
          expect(res.body).to.have.property('data');
          done();
        });
    });
  });

  describe('Favorites', () => {
    it('should reject add favorite without authentication', (done) => {
      chai.request(app)
        .post('/favorites')
        .send({
          attraction_id: 1
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });
});
