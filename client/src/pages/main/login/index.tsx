import React from 'react';
import styles from './login.module.scss';
import { Button } from '@zendeskgarden/react-buttons';

const LoginPage: React.FC = () => {

  return (
    <div className={styles.loginPage}>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <Button>Button</Button>
    </div>
  )
}

export default LoginPage;
