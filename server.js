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

    // Configura o documento PDF
    const doc = new PDFDocument();
    let pdfData = [];

    // Escuta os dados do PDF enquanto ele é gerado
    doc.on('data', (chunk) => pdfData.push(chunk));
    
    // Quando o PDF termina de ser gerado
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(pdfData);
      
      // Define o cabeçalho para download do PDF com o nome dinâmico
      res.setHeader('Content-Disposition', `attachment; filename="${pdfName}"`);
      res.setHeader('Content-Type', 'application/pdf');
      
      // Envia o PDF como resposta
      res.send(pdfBuffer);
    });

    // Adiciona as respostas ao PDF
    doc.fontSize(12).text('Respostas do Formulário:', { underline: true });
    doc.moveDown();

    Object.keys(answers).forEach((question, index) => {
      doc.text(`${index + 1}. ${question}: ${answers[question]}`);
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    console.error('Erro ao processar o formulário:', error);
    res.status(500).send('Erro ao processar o formulário.');
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
