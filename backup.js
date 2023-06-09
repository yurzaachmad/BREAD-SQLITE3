app.get("/", (req, res) => {
  const page = req.query.page || 1;
  const limit = 3;
  const offset = (page - 1) * limit;

  const params = [];
  const sqlsearch = [];

  if (req.query.string) {
    params.push(req.query.string);
    sqlsearch.push(`string like '%${req.query.string}%'`);
  }

  let sql = "select count(*) as count from bread";
  if (params.length > 0) {
    sql += ` where ${sqlsearch.join(" and ")}`;
  }
  console.log(sql);
  db.all(sql, params, (err, datas) => {
    console.log(datas);
    console.log(datas[0].count);
    const pages = Math.ceil(datas[0].count / limit);
    // console.log(datas);
    sql = "select * from bread";
    if (params.length > 0) {
      sql += ` where ${sqlsearch.join(" and ")}`;
    }

    params.push(limit, offset);
    sql += ` limit $${params.length - 1} offset $${params.length}`;
    console.log(sql);
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.log(err);
      }
      res.render("list", { data: rows, pages, page, offset });
    });
  });
});
//hanya filter
app.get("/", (req, res) => {
  const page = req.query.page || 1;
  const limit = 3;
  const offset = (page - 1) * limit;

  const params = [];
  const sqlsearch = [];

  if (req.query.string) {
    params.push(req.query.string);
    sqlsearch.push(`string like '%${req.query.string}%'`);
  }

  let sql = "select * from bread";
  if (params.length > 0) {
    sql += ` where ${sqlsearch.join(" and ")}`;
  }

  db.all(sql, (err, rows) => {
    if (err) {
      console.log(err);
    }
    res.render("list", { data: rows });
  });
});

// hanya pagination
app.get("/", (req, res) => {
  const page = req.query.page || 1;
  const limit = 3;
  const offset = (page - 1) * limit;

  db.all("select count(*) as count from bread", (err, data) => {
    console.log(data);
    const pages = Math.ceil(data[0].count / limit);
    db.all(
      "select * from bread limit $1 offset $2",
      [limit, offset],
      (err, data) => {
        res.render("list", { data: data, pages, page, offset });
      }
    );
  });
});
