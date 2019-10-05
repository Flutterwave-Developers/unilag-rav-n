import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import queryString from 'query-string';
import axios from 'axios';
import GoogleLogin from 'react-google-login';

import Container from '../layouts/Container';
import { API_BASE_URL } from '../constants';

import bannerSource from '../assets/images/banner.svg';

export default function Home({ navigate }) {

  const [authAction, setAuthAction] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');

  const handleSignup = event => {
    // axios.post(`${API_BASE_URL}/signup`, { email, phone, firstName })
    //   .then(resp => {
    //     localStorage.token = resp.token;
    //     navigate('/');
    //   });
    event.preventDefault();
    navigate('/bot');
  };

  useEffect(() => {
    if (authAction == 'signup')
      initSignup();
    else if (authAction == 'login')
      initLogin();
  }, [authAction]);

  return (
    <div>
      <Navbar>
        <Container>
          <Title>Rav'n</Title>
        </Container>
      </Navbar>

      <Main>
        <Container>
          <Banner src={bannerSource} alt="" />

          <div className="hero">
            <h1 className="heading">Conversational System for Online Purchases</h1>
            <p className="tagline">Order from your favorite stores with your voice, no stress.</p>
            
            <Form
              method="POST"
              action=""
              onSubmit={handleSignup}
            >
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email" 
                  placeholder="johndoe@gmail.com" 
                  onChange={({ target }) => setEmail(target.value)} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel" 
                  placeholder="08031234567" 
                  onChange={({ target }) => setPhone(target.value)} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text" 
                  placeholder="John Doe" 
                  onChange={({ target }) => setFirstName(target.value)} 
                />
              </div>

              <div className="form-group">
                <button type="submit">CONTINUE</button>
              </div>
            </Form>

          </div>
        </Container>
      </Main>
    </div>
  );

}

/** Styled components */
const Navbar = styled.div`
  padding: 20px 0;

  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-family: Montserrat, sans-serif;
  color: hsl(213, 97%, 53%);
  font-weight: bold;
`;

const NavBtn = styled.button`
  background: transparent;
  padding: 14px 12px;
  width: 110px;
  text-align: center;
  border: 1px solid hsl(213, 97%, 53%);
  border-radius: 18px;
  color: hsl(213, 97%, 53%);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: hsl(213, 97%, 53%);
    color: #fff;
    box-shadow: 0 4px 16px hsla(213, 87%, 53%, 0.2);
  }
`;

const Main = styled.main`
  padding: 24px 0;

  > div {
    display: flex;
    justify-content: space-around;

    @media (max-width: 767px) {
      flex-direction: column;
    }
  }

  .hero {
    padding: 0 18px;
  }

  .heading {
    color: hsl(213, 97%, 53%);
    font-size: 2.6rem;
    font-family: Montserrat, sans-serif;
  }

  .tagline {
    color: hsla(220, 20%, 20%, 0.85);
    font-size: 1.1rem;
    padding: 8px 0;
    font-family: "Open Sans", sans-serif;
  }

  .buttons {
    padding: 20px 0;
    margin-top: 20px;

    button {
      background: transparent;
      margin-right: 12px;
      padding: 12px 18px;
      color: hsl(213, 97%, 53%);
      outline: none;
      border: 1px solid hsl(213, 97%, 53%);
      border-radius: 21px;
      outline: none;
      font-family: "Open Sans", sans-serif;
      transition: all 0.3s;

      &:hover {
        background: hsl(213, 97%, 53%);
        box-shadow: 0 4px 16px hsla(213, 87%, 53%, 0.2);
        color: #fff;
        cursor: pointer;
      }
    }
  }
`;

const Banner = styled.img`
  width: 40%;
  padding: 40px 0;

  @media (max-width: 767px) {
    display: none;
  }
`;

const Form = styled.form`
  font-family: "Open Sans";
  font-size: 1.1rem;

  .lead {
    color: #333;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .form-group {
    margin: 12px 0;

    label {
      display: block;
      font-size: 0.8rem;
      margin-bottom: 8px;
      color: #555;
    }

    input {
      background: #fff;
      color: #000;
      border-radius: 4px;
      border: 1px solid #ccc;
      width: 100%;
      padding: 12px 10px;
    }

    button {
      width: 100%;
      background: hsl(213, 97%, 53%);
      color: #fff;
      padding: 12px 18px;
      border: none;
      border-radius: 4px;
      outline: none;
      font-family: "Open Sans", sans-serif;
      cursor: pointer;
    }
  }
`;