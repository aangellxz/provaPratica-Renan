const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

//  Conexão com o MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "senai",
  database: "biblioteca"
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
    return;
  }
  console.log(" Conectado ao MySQL!");
});

//  Criar novo livro
app.post("/livros", (req, res) => {
  const { titulo, autor, ano_publicacao, isbn, disponivel } = req.body;
  if (!titulo || !autor || !ano_publicacao)
    return res.status(400).json({ erro: "Campos obrigatórios faltando!" });

  const sql = "INSERT INTO livros (titulo, autor, ano_publicacao, isbn, disponivel) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [titulo, autor, ano_publicacao, isbn || null, disponivel ?? true], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao cadastrar livro" });
    res.status(201).json({ id: result.insertId, titulo, autor, ano_publicacao, isbn, disponivel, mensagem: "Livro cadastrado com sucesso!" });
  });
});

// Listar todos
app.get("/livros", (req, res) => {
  db.query("SELECT * FROM livros", (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar livros" });
    res.json({ total: results.length, livros: results });
  });
});

// Buscar um livro
app.get("/livros/:id", (req, res) => {
  db.query("SELECT * FROM livros WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar livro" });
    if (results.length === 0) return res.status(404).json({ erro: "Livro não encontrado" });
    res.json(results[0]);
  });
});

//  Atualizar
app.put("/livros/:id", (req, res) => {
    const { id } = req.params;
    const { disponivel } = req.body;
  
    if (disponivel === undefined) {
      return res.status(400).json({ erro: "Campo 'disponivel' é obrigatório" });
    }
  
    const sql = "UPDATE livros SET disponivel = ? WHERE id = ?";
    db.query(sql, [disponivel, id], (err, result) => {
      if (err) {
        console.error("Erro MySQL:", err);
        return res.status(500).json({ erro: "Erro ao atualizar livro" });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Livro não encontrado" });
      }
  
      res.status(200).json({ mensagem: "Livro atualizado com sucesso!" });
    });
  });
  
  
//  Deletar
app.delete("/livros/:id", (req, res) => {
  db.query("DELETE FROM livros WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao remover livro" });
    if (result.affectedRows === 0) return res.status(404).json({ erro: "Livro não encontrado" });
    res.json({ mensagem: "Livro removido com sucesso!" });
  });
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
