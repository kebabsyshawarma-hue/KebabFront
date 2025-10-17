import React from 'react';
import styles from './SocialWidgets.module.css';

const SocialWidgets = ({
  facebook = 'https://www.facebook.com/kebabcarta',
  instagram = 'https://www.instagram.com/kebabcarta',
  twitter = 'https://twitter.com/kebabcarta',
}) => {
  return (
    <div className={styles["social-widgets"]}> {/* Apply the new class */}
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer">
          <i className="fab fa-facebook"></i>
        </a>
      )}
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer">
          <i className="fab fa-instagram"></i>
        </a>
      )}
      {twitter && (
        <a href={twitter} target="_blank" rel="noopener noreferrer">
          <i className="fab fa-twitter"></i>
        </a>
      )}
      {/* Add more social media icons here */}
    </div>
  );
};

export default SocialWidgets;