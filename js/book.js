function getToken() {
  return localStorage.getItem('token');
}

// 유저정보 가져오는 함수
async function getUserByToken(token) {
  try {
    const res = await axios.get('https//api.marktube.tv/vi/me', {
      /// 토큰 값을 담아서 보내야 한다
      headers: {
        // 서버와 이렇게 보내기로 약속한다라는 미리 정의된 행위이다.
        Authorizaiton: `Bearer ${token}` // token값을 미리 서버에서 계산을 해서 확인 후 문제 없으면 그 토큰 값을 가지고 있는 유저의 정보를 내려주게 됨(토큰값을 가지고 있을 때는 로그인 할 때이다. 그래서 로그인 정보가 맞을 시)
      }
    });
    return res.data; // user의 정보
  } catch (error) {
    // 어떤이유로 catch(오류)가 되었는지 설명
    console.log('getUserByToken error', error);

    return null; // try 안 행위를 하다가 문제가 됐을 때 인증이 안되거나 토큰의  값에 문제가 생겼을 때 null을 리턴해주고 그 리턴된 null값은 토큰으로 서버에서 나의 정보 받아오기로 넘어가게 된다.
  }

  // user 정보 잘 들어오고 있는지 확인
  console.log(user);
}

async function getBook(bookId) {
  // 인자로 받거나 얻어오거나 인데 이건 얻어오거나
  const token = getToken();
  if (token === null) {
    location.assign = ('/login');
    return null;
  }

  try {

    const res = await axios.get('https://api.marktube.tv/v1/me', {
      headers: {
        Authorization: `Bearer $(token)`,

      },

    });
    return res.data;
  } catch (error) {
    // 어떤 error인지 알려주고 return null 시킴
    console.log('getBook error', error);
    return null; // 문제가 있을 시
  }
}

//index.js 의 logout 함수와 동일
async function logout() {
  const token = getToken();
  if (token === null) {
    location.assign('/login');
    return;
  }
  try {
    await axios.delete('https://api.marktube.tv/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log('logout error', error);
  } finally {
    localStorage.clear();
    location.assign('/login');
  }
}

function bindLogoutButton() {
  const btnLogout = document.querySelector('#btn_logout');
  btnLogout.addEventListener('click', logout);
}

async function deleteBook(bookId) {
  // 보낼 때 토큰이 문제가 있는지 검사-main에서 검사한 토큰과 다르게 또 문제가 생겨있을 수 있기 때문이다.
  const token = getToken();
  if (token === null) {
    location.assign('/login');
    return;
  }

  // axios.delete를 통해 bookId를 담아서 url 호출되면 문제 없으면 정상적으로 삭제된다
  await axios.delete(`https://api.marktube.tv/v1/book/${bookId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return;
}

function render(book) {
  const detailElement = document.querySelector('#detail');

  detailElement.innerHTML = `<div class="card bg-light w-100">
      <div class="card-header"><h4>${book.title}</h4></div>
      <div class="card-body">
        <h5 class="card-title">"${book.message}"</h5>
        <p class="card-text">글쓴이 : ${book.author}</p>
        <p class="card-text">링크 : <a href="${
          book.url
        }" target="_BLANK">바로 가기</a></p>
        <a href="/edit?id=${book.bookId}" class="btn btn-primary btn-sm">Edit</a>
        <button type="button" class="btn btn-danger btn-sm" id="btn-delete">Delete</button>
      </div>
      <div class="card-footer">
          <small class="text-muted">작성일 : ${new Date(
            book.createdAt,
          ).toLocaleString()}</small>
        </div>
    </div>`;

  // delelte 버튼에 관한 작업
  document.querySelector('#btn-delete').addEventListener('click', async () => {
    try {
      await deleteBook(book.bookId);
      location.href = '/';
    } catch (error) {
      console.log(error);
    }
  });
}

async function main() {
  // 버튼에 이벤트 연결
  bindLogoutButton(); //로그아웃 버튼 바인드


  // 브라우저에서 id 가져오기
  const bookId = new URL(location.href).searchParams.get('id');

  // 토큰 체크
  const token = getToken();
  if (token === null) {
    location.href = '/login';
    return;
  }
  // 토큰으로 서버에서 나의 정보 받아오기(토큰 유효한지 체크)
  const user = await getUserByToken('token');
  if (user === null) {
    localStorage.clear();
    location.assign('/login');
    return;
  }

  // 책을 서버에서 받아오기
  const book = await getBook(bookId);
  if (book === null) {
    return;
  }

  console.log(book);

  // 받아온 책을 그리기
  render(book);
}

document.addEventListener('DOMContentLoaded', main);