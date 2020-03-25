from flask import session
import pandas as pd
import os


class Dataframe:
    __path = os.getcwd() + '/static/uploads/'

    def __init__(self) -> None:
        self.fileread = False
        self.filename = ''
        self.__dataframe = pd.core.frame.DataFrame()
        self.__dataframe_original = pd.core.frame.DataFrame()

    def set_filename(self, filename) -> None:
        self.filename = filename

    def get_filename(self) -> 'str':
        return self.filename

    def set_dataframe(self) -> None:
        path_to_write = self.__path + self.get_filename()
        try:
            self.__dataframe = pd.read_csv(
                path_to_write, dtype=object, encoding='utf-8')
            self.__dataframe_original = pd.read_csv(
                path_to_write, encoding='utf-8')
            self.__dataframe.fillna("0", inplace=True)
            self.__dataframe_original.fillna(0, inplace=True)
            self.fileread = True
        except Exception as e:
            print(e)

    def get_dataframe(self, flag) -> 'Pandas.dataframe':
        if flag:
            return self.__dataframe
        else:
            return self.__dataframe.head(5)

    def check_data_frame(self) -> None:
        if self.get_dataframe(True).empty:
            self.set_filename(session['filename'])
            self.set_dataframe()

    def get_titles(self) -> 'list':
        self.check_data_frame()
        titles = list(self.__dataframe.columns)
        return titles

    def get_unique_col_val(self) -> 'list':
        self.check_data_frame()
        col_val = [list(self.__dataframe[col].unique())
                   for col in self.__dataframe.columns]
        return col_val

    def get_data_type(self) -> 'list':
        self.check_data_frame()
        return dict(self.__dataframe_original.dtypes)
    
    def get_original_dataframe(self) -> 'pandas.Dataframe':
        self.check_data_frame()
        return self.__dataframe_original
    