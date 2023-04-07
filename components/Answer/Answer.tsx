import React, { useEffect, useState } from "react";
import styles from "./answer.module.css";

interface AnswerProps {
  text: string;
}

export const Answer: React.FC<AnswerProps> = ({ text }) => {
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    setWords(text.split(/(\s+)/)); // split with a regular expression that includes spaces
  }, [text]);

  const shouldBreak = (word: string): boolean => {
    const filter = ["User:", "Plato:", "Socrates:"];
    return filter.includes(word);
  };

  return (
    <div className=' w-[98%] mx-auto'>
      {words.map((word, index) => (
        <span
          key={index}
          className={styles.fadeIn}
          style={{ animationDelay: `${index * 0.01}s` }}
        >
          {shouldBreak(word) ? (
            <span className={word.slice(0, -1)}>
              <br />
              {word}
            </span>
          ) : (
            `${word} `
          )}
        </span>
      ))}
    </div>
  );
};
