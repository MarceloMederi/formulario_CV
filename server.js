const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear JSON e dados de formulário
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para renderizar o formulário (caso você esteja usando um front-end HTML separado)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

// Rota para processar o formulário e gerar o PDF
app.post('/submit', (req, res) => {
  try {
    const answers = req.body;

    // Cria o nome do PDF baseado na resposta da questão 2 (nome completo)
    const pdfName = `${answers['Nome-Completo'] || 'Formulario'}.pdf`;
    const pdfPath = path.join(__dirname, pdfName);

    // Configura o documento PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Adiciona as respostas ao PDF
    doc.fontSize(12).text('Respostas do Formulário:', { underline: true });
    doc.moveDown();

    Object.keys(answers).forEach((question, index) => {
      doc.text(`${index + 1}. ${question}: ${answers[question]}`);
      doc.moveDown();
    });

    doc.end();

    // Envia o PDF para download após o término da escrita no arquivo
    writeStream.on('finish', () => {
      res.download(pdfPath, pdfName, (err) => {
        if (err) {
          console.error('Erro ao enviar o PDF:', err);
          res.status(500).send('Erro ao gerar o PDF.');
        }
        fs.unlinkSync(pdfPath); // Remove o PDF após o download
      });
    });

    writeStream.on('error', (error) => {
      console.error('Erro ao escrever o PDF:', error);
      res.status(500).send('Erro ao processar o PDF.');
    });

  } catch (error) {
    console.error('Erro ao processar o formulário:', error);
    res.status(500).send('Erro ao processar o formulário.');
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
