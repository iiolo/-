function bindLogoutButton(){
    // querySelector를 통해 id가 btn_logout인 DOM을 가져옴
    const btnLogout = document.querySelector('#btn_logout');

    // 로직 이벤트 연결 작업 : 얻어온 btnLogout을 함수 addEventLister를 통해서 click 이벤트, 실제로 click이 일어나면 발생하는 로직 함수 연결하는 설정
    btnLogout.addEventListener('click', logout/*  실제로 click이 일어나면 발생하는 로직 함수 */);

}

function getToken() {
    // getItem에서 token이라는 item이 있는지 localStorage로부터 요청해서 받아옴, 없으면 null 오고 있으면 어떠한 값이 될 것이다.
    return localStorage.getItem('token');
}

// getUserByToken함수는 당연히 서버에 요청했다가 서버에서 response 받았을 때 어떤 정보를 우리한테 던져주는 것으로 비동기 처리이기에 async 키워드를 가진 async function으로 생성
async function getUserByToken(token) {
    try {
        
        const res = await axios.get('https://api.marktube.tv/vi/me', {
            headers :{
                Authorization : `Bearer $(token)`, // 토큰값 넣기(서버랑 규약이 되어 있음), 토큰이 유효하면 user 정보를 res.data에 넣어서 우리한테 돌려줌

            },

        });
        return res.data;// 정상적으로 가져와지면 res(response)의 data라는 property 안 data를 다시 return 해주면 된다. 이 return된 데이터는 user의 정보가 담긴 데이터임
    }catch (error) {
        console.log('getUserByToken error', error);
        return null;
    }
}

// getBooks는 나의 책목록을 내놔라는 요청을 하고 그 요청이 정상적으로 끝나면 response된 데이터를 사용하는 것이기 때문에 이 함수도 비동기 함수 async function 이다
async function getBooks(token) {
    try {
        
        const res = await axios.get('https://api.marktube.tv/vi/me', {
            headers :{
                Authorization : `Bearer $(token)`,

            },

        });
        return res.data;//book 목록
    }catch (error) {
        // 어떤 error인지 알려주고 return null 시킴
        console.log('getBooks error', error);
        return null;//책이 없다
    }
}

// 받아온 데이터를 표현해주는 것이기 때문에 일반 함수를 씀
function render(books){
    const listElement = document.querySelector('#list');
    for(let i = 0; i < books.length; i++) {
        const book = books[i];
        const bookElement = document.createElement('div');
        bookElement.classList.value = 'col-md-4';

        // 하나 하나의 부트스트랩에 있는 카드 스타일로 표현해주기 위해 사용
        bookElement.innerHTML = `
        <div class="card md-4 shadow-sm">
            <div class="card-body">
                <p class="card-text">${book.title === '' ? '제목 없음' : book.title}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <a href="/book?id=${book.bookId}"> 
                            <button 
                            type="button"
                            class="btn btn-sm btn-outline-secondary">
                            View
                            </button>
                        </a>

                        <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary btn-delete"
                        data-book-id = "${book.bookId}">
                        Delete
                        </button> 

                    </div>
                    <small class="text-muted">
                        ${new Date(book.createAt,).toLocaleString()}
                    </small>
                </div>
            </div>
            `;
            listElement.append(bookElement);//bookElement를 listElement에 추가해서 표현
    }
    // 새로 랜더된 view에 조작을 위한 js를 이벤트를 처리해줘야 함
    // btn-delete 클래스를 가진 DOM은 여러개이므로 그 DOM이 forEach를 돌면서 해당 element 하나 하나에 addEventListener를 해주는 것
    document.querySelectorAll('.btn-delete').forEach(element => {
        element.addEventListener('click', async event => {
            // click하면 event 함수 실행
            const bookId = event.target.dataset.bookId;//event의 해당 targent의 dataset의 bookId를 얻어옴
            try{
                await deleteBook(bookId); 
                location.reload(); // deleteBook 함수 정상적으로 되어 삭제가 완료되었으면 location.reload해서(새로고침 해서) 없어진 책은 사라진 형태의 화면이 뜨게 된다.
            }catch(error){
                console.log(error);//문제가 있다면  error 가 로그로 뜨게 됨
            }

        });
    }); 
}

// deleteBook 함수는 서버에 보내서 처리하는 함수이기에 async function
//서버에 책을 지워주는 함수(어떤 책을 지워야할지 정하기 위해 bookId)
async function deleteBook(bookId) {
    // 보낼 때 토큰이 문제가 있는지 검사-main에서 검사한 토큰과 다르게 또 문제가 생겨있을 수 있기 때문이다.
    const token = getToken();
    if (token === null) {
        location.assign('/login');
        return;
    }

    // axios.delete를 통해 bookId를 담아서 url 호출되면 문제 없으면 정상적으로 삭제된다
    await axios.delete(`https://api.marktube.tv/vi/book/${bookId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return;
}


async function main() {
    // 버튼에 이벤트 연결
    bindLogoutButton();

    // 토큰 체크 : 토큰이 로컬(나의 브라우저)에 있는지 확인
    const token = getToken(); // token은 getToken으로부터 얻어옴, token은 문자열 혹은 null
    if(token === null) {
        // null이면 logout이 되고 login 페이지으로 변경
        location.assign('/login');
        return;
    }

    // 토큰으로 서버에서 나의 정보 받아오기
    const user = await getUserByToken(token); /*getUserByToken에서 return된 데이터 */
    if(user  === null) {
        localStorage.clear(); // 로그아웃 시킴. 로그아웃 시킬 시 localStorage에 있는 토큰 값을 없애는 함수 clear 호출
        location.assign('/login'); // 토큰 없앤 후 location을 다른 경로로 assign 해줌
        return;
    }
    

    // 나의 책(책목록)을 서버에서 받아오기
    const books = await getBooks(token);
    if(books === null) {
        return;//책이 없으면 받아온 책을 그릴 수 없기 때문에 여기서 끝냄
    }

    // 받아온 책을 그리기- 위 절차들에서 받아온 book 데이터가 들어있음     
    render(books);//책을 인자로 해서 render 함수 실행
}