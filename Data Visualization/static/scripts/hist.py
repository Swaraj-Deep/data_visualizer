import pandas as pd
import matplotlib.pyplot as plt
df=pd.read_csv('/home/swaraj/Public/Data Analysis and google forms/data_visualization/Data Visualization/static/uploads/netflix.csv')


plt.figure(num=None, figsize=(20, 10), dpi=80, facecolor='w', edgecolor='k')
df['release_year'].sort_values().hist(bins=100)
plt.xlabel('Release Year', fontsize=20)
plt.ylabel('Number of seasons', fontsize=20)
plt.title('Graph for release_year', fontsize=20)
plt.xticks(rotation=45)


plt.savefig('static/graphs/output1.png')