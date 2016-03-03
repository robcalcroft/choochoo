import express from 'express';
import log from 'morgan';
import path from 'path';
import api from 'routes/api';
import chalk from 'chalk';

let app = express();

app.use(log(':remote-addr - :method :url (:status) - :date'));

app.use(api);

app.use(express.static(path.resolve(path.resolve('.'), 'public/dist')));

app.use('*', (req, res) => {
    res.sendFile(path.resolve('.', 'public/dist/index.html'));
});


app.listen(process.env.PORT || 8000, () => {
    console.log(
        chalk.white.bgBlue(`Server running at 127.0.0.1:${process.env.PORT || 8000}`)
    );
});
