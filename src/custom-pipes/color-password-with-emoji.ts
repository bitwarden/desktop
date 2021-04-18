import {
  Pipe,
  PipeTransform,
} from '@angular/core';

/**
* A pipe that sanitizes HTML and highlights numbers and special characters (in different colors each).
*/
@Pipe({ name: 'colorPasswordWithEmoji' })
export class ColorPasswordPipeWithEmoji implements PipeTransform {
  transform(password: string) {
      // Regex Unicode property escapes for checking if emoji in passwords.
      const regexpEmojiPresentation = /\p{Emoji_Presentation}/gu;
      // Convert to an array to handle cases that stings have special characters, ie: emoji.
      const passwordArray = Array.from(password);
      let colorizedPassword = '';
      for (let i = 0; i < passwordArray.length; i++) {
          let character = passwordArray[i];
          let isSpecial = false;
          // Sanitize HTML first.
          switch (character) {
              case '&':
                  character = '&amp;';
                  isSpecial = true;
                  break;
              case '<':
                  character = '&lt;';
                  isSpecial = true;
                  break;
              case '>':
                  character = '&gt;';
                  isSpecial = true;
                  break;
              case ' ':
                  character = '&nbsp;';
                  isSpecial = true;
                  break;
              default:
                  break;
          }
          let type = 'letter';
          if (character.match(regexpEmojiPresentation)) {
              type = 'emoji';
          } else if (isSpecial || character.match(/[^\w ]/)) {
              type = 'special';
          } else if (character.match(/\d/)) {
              type = 'number';
          }
          colorizedPassword += '<span class="password-' + type + '">' + character + '</span>';
      }
      return colorizedPassword;
  }
}
