from gtts import gTTS
import pyttsx3
import os


engine = pyttsx3.init('espeak')


def speak(audio):
    # language = 'en-in'
    # myobj = gTTS(text=audio, lang=language, slow=False)
    # myobj.save("read.mp3")
    # os.system("mpg321 read.mp3")
    engine.setProperty('rate', 150)
    engine.say(audio)
    engine.runAndWait()


if __name__ == '__main__':
    with open('mysql.txt', 'r') as text_file:
        text = text_file.readlines()
        for line in text:
            print(line)
            speak(line)
