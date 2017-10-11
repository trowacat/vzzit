$('.btn-shorten').on('click', function () {

  $.ajax({
    url: '/api/shorten',
    type: 'POST',
    dataType: 'JSON',
    data: { url: $('#url-field').val() },
    success: function (data) {
      var resultHTML = '<a class="result" ' + '" href="https://' + data.shortUrl + '">'
        + data.shortUrl + '</a> <button type="button" class="btn" data-clipboard-text="' + data.shortUrl + '">' +
        '<img src="assets/clippy.svg" width="12"> Copy to clipboard' +
          '</button>';
      $('#link').html(resultHTML);
      $('#link').hide().fadeIn('slow');
    }
  });

});

