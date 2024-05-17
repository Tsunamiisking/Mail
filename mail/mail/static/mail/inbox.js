document.addEventListener('DOMContentLoaded', function()  {

 // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  document.querySelector('#submit-button').onclick = compose_email;

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-display').style.display = 'none';

  // Add event listener for the compose form submission
  document.querySelector('#compose-form').onsubmit = function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get values from composition fields
    const recipients = document.querySelector('#compose-recipients').value ;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      headers : {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
      //   Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
};

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === 'inbox'){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        emails.forEach(email => {
            if (email.archived == false){
              // Create a container for each email
            let container = document.createElement('div');
            container.classList.add('email-container');
            container.style.backgroundColor = 'white'

            
            // Email Id
            const ID = email.id
            
            // Create and populate elements for email attributes
            let senderElement = document.createElement('p');
            senderElement.textContent = `From: ${email.sender}`;
            
            let recipientsElement = document.createElement('p');
            recipientsElement.textContent = `To: ${email.recipients.join(', ')}`;
            
            let subjectElement = document.createElement('p');
            subjectElement.textContent = `Subject: ${email.subject}`;
            
            let timeElement = document.createElement('p');
            timeElement.textContent = `Time: ${email.timestamp}`;
            
            let bodyElement = document.createElement('p');
            bodyElement.textContent = email.body;

            let viewbutton = document.createElement('button');
            viewbutton.textContent = 'View Email';
            viewbutton.classList.add('btn', 'btn-primary');
            viewbutton.onclick = () => {
            fetch(`/emails/${ID}`)
            .then(response => response.json())
            .then(email => {
              document.querySelector('#email-display').innerHTML = '';
                // Print email
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'none';
                document.querySelector('#email-display').style.display = 'block';
                
                let emailContentContainer = document.createElement('div');

                let replyButton = document.createElement('button');
                replyButton.classList.add('btn', 'btn-primary');
                replyButton.textContent = 'Reply Button';

                emailContentContainer.appendChild(senderElement);
                emailContentContainer.appendChild(recipientsElement);
                emailContentContainer.appendChild(subjectElement);
                emailContentContainer.appendChild(timeElement);
                emailContentContainer.appendChild(bodyElement);
                emailContentContainer.appendChild(replyButton);

                document.querySelector('#email-display').appendChild(emailContentContainer);

                // Email Id
                const emailID = email.id
                fetch(`/emails/${emailID}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      read: true
                  })
                })


                replyButton.onclick = () => {

                            document.querySelector('#emails-view').style.display = 'none';
                            document.querySelector('#compose-view').style.display = 'block';
                            document.querySelector('#email-display').style.display = 'none';

                            // Reset compose form fields
                            document.querySelector('#compose-recipients').value = '';
                            document.querySelector('#compose-subject').value = '';
                            document.querySelector('#compose-body').value = '';

                            // Prefill the compose form fields
                            document.querySelector('#compose-recipients').value = email.sender;
                            document.querySelector('#compose-recipients').disabled = true;

                            if (!email.subject.startsWith('Re: ')) {
                                document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
                            } else {
                                document.querySelector('#compose-subject').value = email.subject;
                            }
                            
                            document.querySelector('#compose-body').value = `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;

                            // Enable recipients field after prefilling
                            document.querySelector('#compose-recipients').disabled = false;


                };
              

            });
         
            };


            let archivebutton = document.createElement('button');
            archivebutton.textContent = 'Archive Email';
            archivebutton.classList.add('btn', 'btn-primary');
            archivebutton.onclick = () => {
              const csrftoken = document.querySelector('meta[name=csrf-token]').getAttribute('content');
              fetch(`/emails/${ID}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                }),
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrftoken // Include CSRF token in the headers
              }
              })
              .then (response => {
                if (response.ok){
                  window.location.reload();
                }
              })
            }
            

            // Append elements to the container
            container.appendChild(senderElement);
            container.appendChild(recipientsElement);
            container.appendChild(subjectElement);
            container.appendChild(timeElement);
            // container.appendChild(bodyElement);
            container.appendChild(viewbutton);
            container.appendChild(archivebutton);


            // Append the container to the #compose-view element
            if (email.read == true){
              container.style.backgroundColor = 'lightgrey'
            }
            document.querySelector('#emails-view').appendChild(container);
            }
        });


    })



  }
  else if ( mailbox === 'sent'){
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {

      // Print emails
      emails.forEach(email => {
          // Create a container for each email
          document.querySelector('#email-display').innerHTML = '';
          let container = document.createElement('div');
          container.classList.add('email-container');
          // Email Id
          const ID = email.id
          
          // Create and populate elements for email attributes
          let senderElement = document.createElement('p');
          senderElement.textContent = `From: ${email.sender}`;
          
          let recipientsElement = document.createElement('p');
          recipientsElement.textContent = `To: ${email.recipients.join(', ')}`;
          
          let subjectElement = document.createElement('p');
          subjectElement.textContent = `Subject: ${email.subject}`;
          
          let timeElement = document.createElement('p');
          timeElement.textContent = `Time: ${email.timestamp}`;
          
          let bodyElement = document.createElement('p');
          bodyElement.textContent = email.body;
          let viewbutton = document.createElement('button');
            viewbutton.textContent = 'View Email';
            viewbutton.classList.add('btn', 'btn-primary');
            viewbutton.onclick = () => {
            fetch(`/emails/${ID}`)
            .then(response => response.json())
            .then(email => {
                // Print email
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'none';
                document.querySelector('#email-display').style.display = 'block';
                let emailContentContainer = document.createElement('div');
                emailContentContainer.appendChild(senderElement);
                emailContentContainer.appendChild(recipientsElement);
                emailContentContainer.appendChild(subjectElement);
                emailContentContainer.appendChild(timeElement);
                emailContentContainer.appendChild(bodyElement);

                document.querySelector('#email-display').appendChild(emailContentContainer);
            });
         
            }


          // Append elements to the container
          container.appendChild(senderElement);
          container.appendChild(recipientsElement);
          container.appendChild(subjectElement);
          container.appendChild(timeElement);
          container.appendChild(bodyElement);
          container.appendChild(viewbutton);
      

          // Append the container to the #compose-view element
          document.querySelector('#emails-view').appendChild(container);
      });
  });
  }
  else if ( mailbox === 'archive'){
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        emails.forEach(email => {
          // Email Id
          const ID = email.id
          // Create a container for each email
          let container = document.createElement('div');
          container.classList.add('email-container');
          
          // Create and populate elements for email attributes
          let senderElement = document.createElement('p');
          senderElement.textContent = `From: ${email.sender}`;
          
          let recipientsElement = document.createElement('p');
          recipientsElement.textContent = `To: ${email.recipients.join(', ')}`;
          
          let subjectElement = document.createElement('p');
          subjectElement.textContent = `Subject: ${email.subject}`;
          
          let timeElement = document.createElement('p');
          timeElement.textContent = `Time: ${email.timestamp}`;
          
          let bodyElement = document.createElement('p');
          bodyElement.textContent = email.body;
        

          let archivebutton = document.createElement('button');
          archivebutton.textContent = 'Unarchive Email';
          archivebutton.classList.add('btn', 'btn-primary');
          archivebutton.onclick = () => {
          const csrftoken = document.querySelector('meta[name=csrf-token]').getAttribute('content');
            fetch(`/emails/${ID}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              }),
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include CSRF token in the headers
            }
            })
            .then (response => {
              if (response.ok){
                window.location.reload();
              }
            })
          }

          // Append elements to the container
          container.appendChild(senderElement);
          container.appendChild(recipientsElement);
          container.appendChild(subjectElement);
          container.appendChild(timeElement);
          container.appendChild(bodyElement);
          container.appendChild(archivebutton);

          // Append the container to the #compose-view element
          document.querySelector('#emails-view').appendChild(container);
      });
        console.log(emails);

        // ... do something else with emails ...
    }); 
  }
}