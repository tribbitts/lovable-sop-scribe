
export const generateFeedbackForm = (moduleTitle: string, moduleUrl?: string) => {
  return `
    <div id="feedback-section" class="feedback-section" style="
      background: #2a4d3a;
      border-radius: 16px;
      padding: 30px;
      margin: 40px 0;
      border: 2px solid #4a7c59;
    ">
      <h3 style="color: #ffffff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
        📝 Help Us Improve This Training
      </h3>
      
      <p style="color: #cccccc; margin-bottom: 25px;">
        Your feedback helps us create better training experiences. This takes less than 2 minutes.
      </p>

      <form id="feedback-form" style="space-y: 20px;">
        <div style="margin-bottom: 20px;">
          <label style="color: #ffffff; display: block; margin-bottom: 8px; font-weight: 600;">
            How helpful was this training? ⭐
          </label>
          <div class="rating-group" data-rating="helpful" style="display: flex; gap: 10px;">
            ${[1,2,3,4,5].map(num => `
              <button type="button" class="rating-btn" data-value="${num}" style="
                background: #3a5998;
                border: none;
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: bold;
              " onmouseover="this.style.background='#4a69a8'" onmouseout="updateRatingStyle(this)">
                ${num}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="color: #ffffff; display: block; margin-bottom: 8px; font-weight: 600;">
            How clear were the instructions? 📋
          </label>
          <div class="rating-group" data-rating="clear" style="display: flex; gap: 10px;">
            ${[1,2,3,4,5].map(num => `
              <button type="button" class="rating-btn" data-value="${num}" style="
                background: #3a5998;
                border: none;
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: bold;
              " onmouseover="this.style.background='#4a69a8'" onmouseout="updateRatingStyle(this)">
                ${num}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="color: #ffffff; display: block; margin-bottom: 8px; font-weight: 600;">
            Email (optional - for follow-up)
          </label>
          <input type="email" id="feedback-email" placeholder="your.email@company.com" style="
            width: 100%;
            background: #1e2d1e;
            border: 1px solid #4a7c59;
            border-radius: 8px;
            padding: 12px;
            color: white;
          ">
        </div>

        <div style="margin-bottom: 25px;">
          <label style="color: #ffffff; display: block; margin-bottom: 8px; font-weight: 600;">
            Additional Comments
          </label>
          <textarea id="feedback-comments" placeholder="What could we improve? What did you like most?" style="
            width: 100%;
            background: #1e2d1e;
            border: 1px solid #4a7c59;
            border-radius: 8px;
            padding: 12px;
            color: white;
            resize: vertical;
            min-height: 80px;
          "></textarea>
        </div>

        <div style="display: flex; gap: 15px;">
          <button type="submit" id="submit-feedback" style="
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
            Submit Feedback
          </button>
          
          <button type="button" id="skip-feedback" style="
            background: transparent;
            color: #ccc;
            border: 1px solid #666;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
          " onclick="hideFeedbackForm()">
            Skip
          </button>
        </div>
      </form>

      <div id="feedback-success" style="display: none; text-align: center; color: #28a745;">
        <h4>Thank you for your feedback! 🙏</h4>
        <p>Your input helps us improve our training programs.</p>
      </div>
    </div>

    <script>
      let helpfulRating = 0;
      let clearRating = 0;

      // Handle rating button clicks
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('rating-btn')) {
          const group = e.target.closest('.rating-group');
          const ratingType = group.dataset.rating;
          const value = parseInt(e.target.dataset.value);
          
          // Update the rating value
          if (ratingType === 'helpful') {
            helpfulRating = value;
          } else if (ratingType === 'clear') {
            clearRating = value;
          }
          
          // Update button styles in this group
          group.querySelectorAll('.rating-btn').forEach((btn, index) => {
            if (index < value) {
              btn.style.background = '#FFD700';
              btn.style.color = '#000';
            } else {
              btn.style.background = '#3a5998';
              btn.style.color = '#fff';
            }
          });
        }
      });

      function updateRatingStyle(btn) {
        // This function is called on mouseout to maintain selected state
        const group = btn.closest('.rating-group');
        const ratingType = group.dataset.rating;
        const currentRating = ratingType === 'helpful' ? helpfulRating : clearRating;
        const btnValue = parseInt(btn.dataset.value);
        
        if (btnValue <= currentRating) {
          btn.style.background = '#FFD700';
          btn.style.color = '#000';
        } else {
          btn.style.background = '#3a5998';
          btn.style.color = '#fff';
        }
      }

      function hideFeedbackForm() {
        document.getElementById('feedback-section').style.display = 'none';
      }

      // Handle form submission
      document.getElementById('feedback-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const comments = document.getElementById('feedback-comments').value;
        const email = document.getElementById('feedback-email').value;
        
        if (helpfulRating === 0 || clearRating === 0) {
          alert('Please provide both helpfulness and clarity ratings.');
          return;
        }

        try {
          const feedbackData = {
            module_title: "${moduleTitle}",
            module_url: "${moduleUrl || window.location.href}",
            helpful_rating: helpfulRating,
            clear_rating: clearRating,
            comments: comments || null,
            user_email: email || null
          };

          // This would be the actual submission to your backend
          console.log('Feedback data:', feedbackData);
          
          // For demo purposes, show success message
          document.getElementById('feedback-form').style.display = 'none';
          document.getElementById('feedback-success').style.display = 'block';
          
          // In a real implementation, you'd send this to your Supabase edge function:
          // await submitFeedback(feedbackData);
          
        } catch (error) {
          console.error('Error submitting feedback:', error);
          alert('There was an error submitting your feedback. Please try again.');
        }
      });

      // Optional: Auto-save draft feedback to localStorage
      function saveFeedbackDraft() {
        const draft = {
          helpful: helpfulRating,
          clear: clearRating,
          comments: document.getElementById('feedback-comments').value,
          email: document.getElementById('feedback-email').value
        };
        localStorage.setItem('feedback-draft-${moduleTitle}', JSON.stringify(draft));
      }

      // Auto-save every 30 seconds
      setInterval(saveFeedbackDraft, 30000);
    </script>
  `;
};
