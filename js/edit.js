// book 추가할 때랑 같은 모습이고 input 창에 기존 id로부터 책을 서버에서 얻어온 다음 그 정보를 바탕으로 input창에 채워넣고 그것을 수정하는 방향으로 작업 진행


function getToken(){
    return localStorage.getItem('token');
}

// 유저정보 가져오는 함수
async function getUserByToken(token) {
    try{
        const res = await axios.get('https//api.marktube.tv/vi/me',{
            /// 토큰 값을 담아서 보내야 한다
            headers : {
                // 서버와 이렇게 보내기로 약속한다라는 미리 정의된 행위이다.
                Authorizaiton : `Bearer ${token}` // token값을 미리 서버에서 계산을 해서 확인 후 문제 없으면 그 토큰 값을 가지고 있는 유저의 정보를 내려주게 됨(토큰값을 가지고 있을 때는 로그인 할 때이다. 그래서 로그인 정보가 맞을 시)
            }
        });
        return res.data; // user의 정보
    }catch(error){
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
    if(token === null){
        location.assign=('/login');
        return null;
    }

    try {
        
        const res = await axios.get('https://api.marktube.tv/v1/me', {
            headers :{
                Authorization : `Bearer $(token)`,

            },

        });
        return res.data;
    }catch (error) {
        // 어떤 error인지 알려주고 return null 시킴
        console.log('getBook error', error);
        return null;// 문제가 있을 시
    }
}

// bookId를 가지고 update하는 함수
async function updateBook(bookId){
    const titleElement = document.querySelector('#title');
    const messageElement = document.querySelector('#message');
    const authorElement = document.querySelector('#author');
    const urlElement = document.querySelector('#url');

    const title = titleElement.value;
    const message = messageElement.value;
    const author = authorElement.value;
    const url = urlElement.value;

    if(title === '' || message === '' || author === '' || url === '' ) {
        return;
    }

    const token = getToken();
    if(token === null){
        location.assign('/login');
        return;
    }

    await axios.patch(
        `https://api.marktube.tv/v1/book/${bookId}`, 
        {
        title,
        message,
        author,
        url,
        }, 
        {
            headers : {
            Authorizaiton: `Bearer ${token}`,
            },
            
        },
    );
}



function render(book) {
    const titleElement = document.querySelector('#title');
    titleElement.value = book.title;
  
    const messageElement = document.querySelector('#message');
    messageElement.value = book.message;
  
    const authorElement = document.querySelector('#author');
    authorElement.value = book.author;
  
    const urlElement = document.querySelector('#url');
    urlElement.value = book.url;
  
    const form = document.querySelector('#form-edit-book');//id가 form-edit-book인 form DOM을 얻어옴
    form.addEventListener('submit', async event => {
      event.preventDefault();
      event.stopPropagation();
      event.target.classList.add('was-validated');
  
      try {
        await updateBook(book.bookId);
        location.href = `book?id=${book.bookId}`;
      } catch (error) {
        console.log(error);
      }
    });

    const cancelButtonElement = document.querySelector('#btn-cancel');
    cancelButtonElement.addEventListener('click', async event => {
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.add('was-validated');

            location.assign(`book?id=${book.bookId}`);
        })
    }

async function main(){
    //브라우저에서 id 가져오기
    const bookId = new URL(location.href).searchParams.get('id');

    // 토큰 체크
    const token = getToken();
    if(token === null){
        location.href='/login';
        return;
    }

    // 토큰으로 서버에서 나의 정보 받아오기(토큰 유효성 체크)
    const user = await getUserByToken('token'); 
    if(user===null){
        localStorage.clear();
        location.assign('/login');
        return;
    }

    // 책을 서버에서 받아오기
    const book = await getBook(bookId);
    if(book === null) {
        return;
    }

    console.log(book);

    // 받아온 책을 그리기(책을 폼에다 넣어주는 작업)
    render(book);

}

document.addEventListener('DOMContentLoaded', main);