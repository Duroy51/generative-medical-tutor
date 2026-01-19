# Contexte Complet du Projet - Generative Medical Tutor

**Généré le:** 2026-01-17T08:51:25.556Z

---

## 📊 Statistiques du Projet

- **Fichiers traités:** 2292
- **Fichiers ignorés:** 3797
- **Taille totale:** 17.89 MB
- **Erreurs:** 0

---

## 🏗️ Architecture du Projet

### Structure Générale

Le projet est structuré en deux parties principales:
- **Frontend:** Next.js (React) - Application web moderne
- **Backend:** Django (Python) - API RESTful

## 📂 Arborescence Complète

```
[object Promise]```

---

## ⚙️ Fichiers de Configuration

### 📄 `.venv\Lib\site-packages\django\contrib\admindocs\urls.py`

```py
from django.contrib.admindocs import views
from django.urls import path, re_path

urlpatterns = [
    path(
        "",
        views.BaseAdminDocsView.as_view(template_name="admin_doc/index.html"),
        name="django-admindocs-docroot",
    ),
    path(
        "bookmarklets/",
        views.BookmarkletsView.as_view(),
        name="django-admindocs-bookmarklets",
    ),
    path(
        "tags/",
        views.TemplateTagIndexView.as_view(),
        name="django-admindocs-tags",
    ),
    path(
        "filters/",
        views.TemplateFilterIndexView.as_view(),
        name="django-admindocs-filters",
    ),
    path(
        "views/",
        views.ViewIndexView.as_view(),
        name="django-admindocs-views-index",
    ),
    path(
        "views/<view>/",
        views.ViewDetailView.as_view(),
        name="django-admindocs-views-detail",
    ),
    path(
        "models/",
        views.ModelIndexView.as_view(),
        name="django-admindocs-models-index",
    ),
    re_path(
        r"^models/(?P<app_label>[^.]+)\.(?P<model_name>[^/]+)/$",
        views.ModelDetailView.as_view(),
        name="django-admindocs-models-detail",
    ),
    path(
        "templates/<path:template>/",
        views.TemplateDetailView.as_view(),
        name="django-admindocs-templates",
    ),
]

```

### 📄 `.venv\Lib\site-packages\django\contrib\auth\urls.py`

```py
# The views used below are normally mapped in the AdminSite instance.
# This URLs file is used to provide a reliable view deployment for test purposes.
# It is also provided as a convenience to those who want to deploy these URLs
# elsewhere.

from django.contrib.auth import views
from django.urls import path

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path(
        "password_change/", views.PasswordChangeView.as_view(), name="password_change"
    ),
    path(
        "password_change/done/",
        views.PasswordChangeDoneView.as_view(),
        name="password_change_done",
    ),
    path("password_reset/", views.PasswordResetView.as_view(), name="password_reset"),
    path(
        "password_reset/done/",
        views.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    path(
        "reset/<uidb64>/<token>/",
        views.PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "reset/done/",
        views.PasswordResetCompleteView.as_view(),
        name="password_reset_complete",
    ),
]

```

### 📄 `.venv\Lib\site-packages\django\contrib\flatpages\urls.py`

```py
from django.contrib.flatpages import views
from django.urls import path

urlpatterns = [
    path("<path:url>", views.flatpage, name="django.contrib.flatpages.views.flatpage"),
]

```

### 📄 `.venv\Lib\site-packages\django\core\checks\urls.py`

```py
import inspect
from collections import Counter

from django.conf import settings
from django.core.exceptions import ViewDoesNotExist

from . import Error, Tags, Warning, register


@register(Tags.urls)
def check_url_config(app_configs, **kwargs):
    if getattr(settings, "ROOT_URLCONF", None):
        from django.urls import get_resolver

        resolver = get_resolver()
        return check_resolver(resolver)
    return []


def check_resolver(resolver):
    """
    Recursively check the resolver.
    """
    check_method = getattr(resolver, "check", None)
    if check_method is not None:
        return check_method()
    elif not hasattr(resolver, "resolve"):
        return get_warning_for_invalid_pattern(resolver)
    else:
        return []


@register(Tags.urls)
def check_url_namespaces_unique(app_configs, **kwargs):
    """
    Warn if URL namespaces used in applications aren't unique.
    """
    if not getattr(settings, "ROOT_URLCONF", None):
        return []

    from django.urls import get_resolver

    resolver = get_resolver()
    all_namespaces = _load_all_namespaces(resolver)
    counter = Counter(all_namespaces)
    non_unique_namespaces = [n for n, count in counter.items() if count > 1]
    errors = []
    for namespace in non_unique_namespaces:
        errors.append(
            Warning(
                "URL namespace '{}' isn't unique. You may not be able to reverse "
                "all URLs in this namespace".format(namespace),
                id="urls.W005",
            )
        )
    return errors


def _load_all_namespaces(resolver, parents=()):
    """
    Recursively load all namespaces from URL patterns.
    """
    url_patterns = getattr(resolver, "url_patterns", [])
    namespaces = [
        ":".join(parents + (url.namespace,))
        for url in url_patterns
        if getattr(url, "namespace", None) is not None
    ]
    for pattern in url_patterns:
        namespace = getattr(pattern, "namespace", None)
        current = parents
        if namespace is not None:
            current += (namespace,)
        namespaces.extend(_load_all_namespaces(pattern, current))
    return namespaces


def get_warning_for_invalid_pattern(pattern):
    """
    Return a list containing a warning that the pattern is invalid.

    describe_pattern() cannot be used here, because we cannot rely on the
    urlpattern having regex or name attributes.
    """
    if isinstance(pattern, str):
        hint = (
            "Try removing the string '{}'. The list of urlpatterns should not "
            "have a prefix string as the first element.".format(pattern)
        )
    elif isinstance(pattern, tuple):
        hint = "Try using path() instead of a tuple."
    else:
        hint = None

    return [
        Error(
            "Your URL pattern {!r} is invalid. Ensure that urlpatterns is a list "
            "of path() and/or re_path() instances.".format(pattern),
            hint=hint,
            id="urls.E004",
        )
    ]


@register(Tags.urls)
def check_url_settings(app_configs, **kwargs):
    errors = []
    for name in ("STATIC_URL", "MEDIA_URL"):
        value = getattr(settings, name)
        if value and not value.endswith("/"):
            errors.append(E006(name))
    return errors


def E006(name):
    return Error(
        "The {} setting must end with a slash.".format(name),
        id="urls.E006",
    )


@register(Tags.urls)
def check_custom_error_handlers(app_configs, **kwargs):
    if not getattr(settings, "ROOT_URLCONF", None):
        return []

    from django.urls import get_resolver

    resolver = get_resolver()

    errors = []
    # All handlers take (request, exception) arguments except handler500
    # which takes (request).
    for status_code, num_parameters in [(400, 2), (403, 2), (404, 2), (500, 1)]:
        try:
            handler = resolver.resolve_error_handler(status_code)
        except (ImportError, ViewDoesNotExist) as e:
            path = getattr(resolver.urlconf_module, "handler%s" % status_code)
            msg = (
                "The custom handler{status_code} view '{path}' could not be "
                "imported."
            ).format(status_code=status_code, path=path)
            errors.append(Error(msg, hint=str(e), id="urls.E008"))
            continue
        signature = inspect.signature(handler)
        args = [None] * num_parameters
        try:
            signature.bind(*args)
        except TypeError:
            msg = (
                "The custom handler{status_code} view '{path}' does not "
                "take the correct number of arguments ({args})."
            ).format(
                status_code=status_code,
                path=handler.__module__ + "." + handler.__qualname__,
                args="request, exception" if num_parameters == 2 else "request",
            )
            errors.append(Error(msg, id="urls.E007"))
    return errors

```

### 📄 `.venv\Lib\site-packages\pip\_internal\utils\urls.py`

```py
import os
import string
import urllib.parse
import urllib.request

from .compat import WINDOWS


def path_to_url(path: str) -> str:
    """
    Convert a path to a file: URL.  The path will be made absolute and have
    quoted path parts.
    """
    path = os.path.normpath(os.path.abspath(path))
    url = urllib.parse.urljoin("file://", urllib.request.pathname2url(path))
    return url


def url_to_path(url: str) -> str:
    """
    Convert a file: URL to a path.
    """
    assert url.startswith(
        "file:"
    ), f"You can only turn file: urls into filenames (not {url!r})"

    _, netloc, path, _, _ = urllib.parse.urlsplit(url)

    if not netloc or netloc == "localhost":
        # According to RFC 8089, same as empty authority.
        netloc = ""
    elif WINDOWS:
        # If we have a UNC path, prepend UNC share notation.
        netloc = "\\\\" + netloc
    else:
        raise ValueError(
            f"non-local file URIs are not supported on this platform: {url!r}"
        )

    path = urllib.request.url2pathname(netloc + path)

    # On Windows, urlsplit parses the path as something like "/C:/Users/foo".
    # This creates issues for path-related functions like io.open(), so we try
    # to detect and strip the leading slash.
    if (
        WINDOWS
        and not netloc  # Not UNC.
        and len(path) >= 3
        and path[0] == "/"  # Leading slash to strip.
        and path[1] in string.ascii_letters  # Drive letter.
        and path[2:4] in (":", ":/")  # Colon + end of string, or colon + absolute path.
    ):
        path = path[1:]

    return path

```

### 📄 `.venv\Lib\site-packages\rest_framework\settings.py`

```py
"""
Settings for REST framework are all namespaced in the REST_FRAMEWORK setting.
For example your project's `settings.py` file might look like this:

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.TemplateHTMLRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}

This module provides the `api_setting` object, that is used to access
REST framework settings, checking for user settings first, then falling
back to the defaults.
"""
from django.conf import settings
# Import from `django.core.signals` instead of the official location
# `django.test.signals` to avoid importing the test module unnecessarily.
from django.core.signals import setting_changed
from django.utils.module_loading import import_string

from rest_framework import ISO_8601

DEFAULTS = {
    # Base API policies
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication'
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_THROTTLE_CLASSES': [],
    'DEFAULT_CONTENT_NEGOTIATION_CLASS': 'rest_framework.negotiation.DefaultContentNegotiation',
    'DEFAULT_METADATA_CLASS': 'rest_framework.metadata.SimpleMetadata',
    'DEFAULT_VERSIONING_CLASS': None,

    # Generic view behavior
    'DEFAULT_PAGINATION_CLASS': None,
    'DEFAULT_FILTER_BACKENDS': [],

    # Schema
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.openapi.AutoSchema',

    # Throttling
    'DEFAULT_THROTTLE_RATES': {
        'user': None,
        'anon': None,
    },
    'NUM_PROXIES': None,

    # Pagination
    'PAGE_SIZE': None,

    # Filtering
    'SEARCH_PARAM': 'search',
    'ORDERING_PARAM': 'ordering',

    # Versioning
    'DEFAULT_VERSION': None,
    'ALLOWED_VERSIONS': None,
    'VERSION_PARAM': 'version',

    # Authentication
    'UNAUTHENTICATED_USER': 'django.contrib.auth.models.AnonymousUser',
    'UNAUTHENTICATED_TOKEN': None,

    # View configuration
    'VIEW_NAME_FUNCTION': 'rest_framework.views.get_view_name',
    'VIEW_DESCRIPTION_FUNCTION': 'rest_framework.views.get_view_description',

    # Exception handling
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'NON_FIELD_ERRORS_KEY': 'non_field_errors',

    # Testing
    'TEST_REQUEST_RENDERER_CLASSES': [
        'rest_framework.renderers.MultiPartRenderer',
        'rest_framework.renderers.JSONRenderer'
    ],
    'TEST_REQUEST_DEFAULT_FORMAT': 'multipart',

    # Hyperlink settings
    'URL_FORMAT_OVERRIDE': 'format',
    'FORMAT_SUFFIX_KWARG': 'format',
    'URL_FIELD_NAME': 'url',

    # Input and output formats
    'DATE_FORMAT': ISO_8601,
    'DATE_INPUT_FORMATS': [ISO_8601],

    'DATETIME_FORMAT': ISO_8601,
    'DATETIME_INPUT_FORMATS': [ISO_8601],

    'TIME_FORMAT': ISO_8601,
    'TIME_INPUT_FORMATS': [ISO_8601],

    # Encoding
    'UNICODE_JSON': True,
    'COMPACT_JSON': True,
    'STRICT_JSON': True,
    'COERCE_DECIMAL_TO_STRING': True,
    'UPLOADED_FILES_USE_URL': True,

    # Browsable API
    'HTML_SELECT_CUTOFF': 1000,
    'HTML_SELECT_CUTOFF_TEXT': "More than {count} items...",

    # Schemas
    'SCHEMA_COERCE_PATH_PK': True,
    'SCHEMA_COERCE_METHOD_NAMES': {
        'retrieve': 'read',
        'destroy': 'delete'
    },
}


# List of settings that may be in string import notation.
IMPORT_STRINGS = [
    'DEFAULT_RENDERER_CLASSES',
    'DEFAULT_PARSER_CLASSES',
    'DEFAULT_AUTHENTICATION_CLASSES',
    'DEFAULT_PERMISSION_CLASSES',
    'DEFAULT_THROTTLE_CLASSES',
    'DEFAULT_CONTENT_NEGOTIATION_CLASS',
    'DEFAULT_METADATA_CLASS',
    'DEFAULT_VERSIONING_CLASS',
    'DEFAULT_PAGINATION_CLASS',
    'DEFAULT_FILTER_BACKENDS',
    'DEFAULT_SCHEMA_CLASS',
    'EXCEPTION_HANDLER',
    'TEST_REQUEST_RENDERER_CLASSES',
    'UNAUTHENTICATED_USER',
    'UNAUTHENTICATED_TOKEN',
    'VIEW_NAME_FUNCTION',
    'VIEW_DESCRIPTION_FUNCTION'
]


# List of settings that have been removed
REMOVED_SETTINGS = [
    'PAGINATE_BY', 'PAGINATE_BY_PARAM', 'MAX_PAGINATE_BY',
]


def perform_import(val, setting_name):
    """
    If the given setting is a string import notation,
    then perform the necessary import or imports.
    """
    if val is None:
        return None
    elif isinstance(val, str):
        return import_from_string(val, setting_name)
    elif isinstance(val, (list, tuple)):
        return [import_from_string(item, setting_name) for item in val]
    return val


def import_from_string(val, setting_name):
    """
    Attempt to import a class from a string representation.
    """
    try:
        return import_string(val)
    except ImportError as e:
        msg = "Could not import '%s' for API setting '%s'. %s: %s." % (val, setting_name, e.__class__.__name__, e)
        raise ImportError(msg)


class APISettings:
    """
    A settings object that allows REST Framework settings to be accessed as
    properties. For example:

        from rest_framework.settings import api_settings
        print(api_settings.DEFAULT_RENDERER_CLASSES)

    Any setting with string import paths will be automatically resolved
    and return the class, rather than the string literal.

    Note:
    This is an internal class that is only compatible with settings namespaced
    under the REST_FRAMEWORK name. It is not intended to be used by 3rd-party
    apps, and test helpers like `override_settings` may not work as expected.
    """
    def __init__(self, user_settings=None, defaults=None, import_strings=None):
        if user_settings:
            self._user_settings = self.__check_user_settings(user_settings)
        self.defaults = defaults or DEFAULTS
        self.import_strings = import_strings or IMPORT_STRINGS
        self._cached_attrs = set()

    @property
    def user_settings(self):
        if not hasattr(self, '_user_settings'):
            self._user_settings = getattr(settings, 'REST_FRAMEWORK', {})
        return self._user_settings

    def __getattr__(self, attr):
        if attr not in self.defaults:
            raise AttributeError("Invalid API setting: '%s'" % attr)

        try:
            # Check if present in user settings
            val = self.user_settings[attr]
        except KeyError:
            # Fall back to defaults
            val = self.defaults[attr]

        # Coerce import strings into classes
        if attr in self.import_strings:
            val = perform_import(val, attr)

        # Cache the result
        self._cached_attrs.add(attr)
        setattr(self, attr, val)
        return val

    def __check_user_settings(self, user_settings):
        SETTINGS_DOC = "https://www.django-rest-framework.org/api-guide/settings/"
        for setting in REMOVED_SETTINGS:
            if setting in user_settings:
                raise RuntimeError("The '%s' setting has been removed. Please refer to '%s' for available settings." % (setting, SETTINGS_DOC))
        return user_settings

    def reload(self):
        for attr in self._cached_attrs:
            delattr(self, attr)
        self._cached_attrs.clear()
        if hasattr(self, '_user_settings'):
            delattr(self, '_user_settings')


api_settings = APISettings(None, DEFAULTS, IMPORT_STRINGS)


def reload_api_settings(*args, **kwargs):
    setting = kwargs['setting']
    if setting == 'REST_FRAMEWORK':
        api_settings.reload()


setting_changed.connect(reload_api_settings)

```

### 📄 `.venv\Lib\site-packages\rest_framework\urls.py`

```py
"""
Login and logout views for the browsable API.

Add these to your root URLconf if you're using the browsable API and
your API requires authentication:

    urlpatterns = [
        ...
        path('auth/', include('rest_framework.urls'))
    ]

You should make sure your authentication settings include `SessionAuthentication`.
"""
from django.contrib.auth import views
from django.urls import path

app_name = 'rest_framework'
urlpatterns = [
    path('login/', views.LoginView.as_view(template_name='rest_framework/login.html'), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]

```

### 📄 `.venv\Lib\site-packages\rest_framework\utils\urls.py`

```py
from urllib import parse

from django.utils.encoding import force_str


def replace_query_param(url, key, val):
    """
    Given a URL and a key/val pair, set or replace an item in the query
    parameters of the URL, and return the new URL.
    """
    (scheme, netloc, path, query, fragment) = parse.urlsplit(force_str(url))
    query_dict = parse.parse_qs(query, keep_blank_values=True)
    query_dict[force_str(key)] = [force_str(val)]
    query = parse.urlencode(sorted(query_dict.items()), doseq=True)
    return parse.urlunsplit((scheme, netloc, path, query, fragment))


def remove_query_param(url, key):
    """
    Given a URL and a key/val pair, remove an item in the query
    parameters of the URL, and return the new URL.
    """
    (scheme, netloc, path, query, fragment) = parse.urlsplit(force_str(url))
    query_dict = parse.parse_qs(query, keep_blank_values=True)
    query_dict.pop(key, None)
    query = parse.urlencode(sorted(query_dict.items()), doseq=True)
    return parse.urlunsplit((scheme, netloc, path, query, fragment))

```

### 📄 `backend\api\urls.py`

```py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from cases.views import ClinicalCaseViewSet, CategoryViewSet
from simulation.views import SimulationViewSet


router = DefaultRouter()


router.register(r'cases', ClinicalCaseViewSet, basename='case')
router.register(r'simulations', SimulationViewSet, basename='simulation')
router.register(r'categories', CategoryViewSet, basename='category') # <--- AJOUTEZ CECI


urlpatterns = [

    path('', include(router.urls)),

    path('users/', include('users.urls')),
]
```

### 📄 `backend\cases\urls.py`

```py
# backend/cases/urls.py
from rest_framework.routers import DefaultRouter
from .views import ClinicalCaseViewSet

router = DefaultRouter()
router.register(r'cases', ClinicalCaseViewSet, basename='case')

urlpatterns = router.urls
```

### 📄 `backend\core\settings.py`

```py
"""
Django settings for core project.

Generated by 'django-admin startproject' using Django 5.2.7.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-#p=#a-&(dos)#&5ed#8-l)!k+cc=6hb_3ze&)g=u45zn4-*p!$"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Dépendances tierces
    'rest_framework',
    "corsheaders",
    "django_filters",

    # Nos applications locales
    'users.apps.UsersConfig',
    'cases.apps.CasesConfig',
    'simulation.apps.SimulationConfig',
    'evaluation.apps.EvaluationConfig',
    'api.apps.ApiConfig',
    'rest_framework_simplejwt'
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"



load_dotenv(os.path.join(BASE_DIR, '.env'))

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")




REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
}

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "datasets")
MINIO_USE_SECURE = False

# backend/core/settings.py

# ... à la fin du fichier ...

SIMPLE_JWT = {
    # Durée du token d'accès (celui utilisé pour les requêtes API)
    # 60 minutes est un bon compromis. L'étudiant a le temps de finir sa simulation.
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),

    # Durée du token de rafraîchissement (celui qui permet de rester connecté sans remettre le mot de passe)
    # 7 jours permet à l'utilisateur de revenir le lendemain sans se reconnecter.
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # Optionnel mais recommandé : Rotation des tokens
    # À chaque fois qu'on utilise le refresh token, on en reçoit un nouveau.
    # Cela permet de garder une session active indéfiniment tant que l'utilisateur est actif.
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,

    # ... on garde les autres réglages par défaut
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

FULTANG_API_URL = os.getenv("FULTANG_API_URL")
FULTANG_API_KEY = os.getenv("FULTANG_API_KEY")
```

### 📄 `backend\core\urls.py`

```py
"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/', include('api.urls')),
]

```

### 📄 `backend\manage.py`

```py
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()

```

### 📄 `backend\requirements.txt`

```txt
annotated-types==0.7.0
anyio==4.11.0
argon2-cffi==25.1.0
argon2-cffi-bindings==25.1.0
asgiref==3.10.0
cachetools==6.2.1
certifi==2025.10.5
cffi==2.0.0
charset-normalizer==3.4.4
colorama==0.4.6
distro==1.9.0
Django==5.2.7
django-cors-headers==4.9.0
django-filter==25.2
djangorestframework==3.16.1
djangorestframework_simplejwt==5.5.1
filetype==1.2.0
google-ai-generativelanguage==0.9.0
google-api-core==2.27.0
google-api-python-client==2.185.0
google-auth==2.41.1
google-auth-httplib2==0.2.0
googleapis-common-protos==1.71.0
groq==0.37.1
grpcio==1.76.0
grpcio-status==1.71.2
h11==0.16.0
httpcore==1.0.9
httplib2==0.31.0
httpx==0.28.1
idna==3.11
jsonpatch==1.33
jsonpointer==3.0.0
langchain==1.0.3
langchain-core==1.2.1
langchain-groq==1.1.1
langgraph==1.0.2
langgraph-checkpoint==3.0.0
langgraph-prebuilt==1.0.2
langgraph-sdk==0.2.9
langsmith==0.4.39
minio==7.2.18
orjson==3.11.4
ormsgpack==1.11.0
packaging==25.0
proto-plus==1.26.1
protobuf==5.29.5
psycopg2-binary==2.9.11
pyasn1==0.6.1
pyasn1_modules==0.4.2
pycparser==2.23
pycryptodome==3.23.0
pydantic==2.12.3
pydantic_core==2.41.4
PyJWT==2.10.1
pyparsing==3.2.5
python-dotenv==1.1.1
PyYAML==6.0.3
requests==2.32.5
requests-toolbelt==1.0.0
rsa==4.9.1
sniffio==1.3.1
sqlparse==0.5.3
tenacity==9.1.2
tqdm==4.67.1
typing-inspection==0.4.2
typing_extensions==4.15.0
tzdata==2025.2
uritemplate==4.2.0
urllib3==2.5.0
uuid_utils==0.12.0
xxhash==3.6.0
zstandard==0.25.0

```

### 📄 `backend\simulation\urls.py`

```py
# backend/simulation/urls.py

from rest_framework.routers import DefaultRouter
from .views import SimulationViewSet

router = DefaultRouter()
router.register(r'simulations', SimulationViewSet, basename='simulation')

urlpatterns = router.urls
```

### 📄 `backend\users\urls.py`

```py

from django.urls import path
from .views import UserRegisterView, MyTokenObtainPairView, UserMeView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user_register'),
    path('token/',  MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view(), name='user_me'),
]
```

### 📄 `frontendv3\package.json`

```json
{
  "name": "frontendv3",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "axios": "^1.13.2",
    "clsx": "^2.1.1",
    "dagre": "^0.8.5",
    "driver.js": "^1.4.0",
    "framer-motion": "^12.23.26",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.561.0",
    "next": "16.0.10",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "react-hot-toast": "^2.6.0",
    "reactflow": "^11.11.4",
    "recharts": "^3.6.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/dagre": "^0.7.53",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.23",
    "eslint": "^9",
    "eslint-config-next": "16.0.10",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "^5"
  }
}

```

### 📄 `frontendv3\README.md`

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

### 📄 `frontendv3\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```

### 📄 `README.md`

```md
### Racine du Projet

*   **`backend/`** : Contient l'intégralité du projet Django. C'est le cœur de notre application.
*   **`frontend/`** : Contient l'intégralité du projet Next.js. Il sera développé par le pôle UX.
*   **`docker-compose.yml`** : Fichier d'orchestration Docker. C'est le "chef d'orchestre" qui lance et connecte tous les services (backend, frontend, base de données) d'un coup.
*   **`.gitignore`** : Spécifie les fichiers et dossiers que Git doit ignorer (ex: `venv/`, `__pycache__/`).

### `backend/` (Projet Django)

*   **`core/`** : Le "cœur" du projet Django. Il contient les fichiers de configuration globaux (`settings.py`), les routes URL principales (`urls.py`) et la configuration du serveur (`wsgi.py`, `asgi.py`).
*   **`manage.py`** : L'utilitaire en ligne de commande de Django, utilisé pour exécuter toutes les tâches de gestion (lancer le serveur, créer des migrations, etc.).
*   **`requirements.txt`** : La liste de toutes les dépendances Python du projet.
*   **`venv/`** : (Ignoré par Git) Le dossier de l'environnement virtuel Python, isolant les dépendances.

#### Applications Django

*   **`users/`** : Gère tout ce qui concerne les utilisateurs : modèles de profils (apprenant, expert), authentification, et permissions.
*   **`cases/`** : Au cœur de la mission de l'**Agent Ingénieur des Données**.
    *   **`models.py`** : Définit la structure des cas cliniques en base de données.
    *   **`logic/`** (à créer) : Contient la logique d'import depuis Fultang, d'anonymisation et de génération de fiches via le LLM.
    *   **`views.py`** : Gère les requêtes API pour la validation des cas par les experts.
*   **`simulation/`** : Gère la logique de l'**Agent Orchestrateur** et de l'**Agent Simulateur**.
    *   **`models.py`** : Définit les sessions de simulation, l'historique des conversations, etc.
    *   **`logic/`** (à créer) : Contient la logique de dialogue, la construction des prompts et l'implémentation de la RAG.
*   **`evaluation/`** : Gère la logique de l'**Agent Évaluateur-Tuteur**.
    *   **`logic/`** (à créer) : Contient les algorithmes de scoring, l'analyse de la performance et la génération des rapports de feedback.
*   **`api/`** : Une application dédiée à l'organisation de notre API REST. Elle centralise les routes de toutes les autres applications pour fournir un point d'entrée unique et propre (`/api/v1/...`).

## 🚀 Démarrage Rapide

Suivez ces instructions pour lancer le projet sur votre machine locale.

### Prérequis

*   [Git](https://git-scm.com/)
*   [Docker](https://www.docker.com/products/docker-desktop/)

### Installation et Lancement

1.  **Clonez le dépôt :**
    ```bash
    git clone [URL_DE_VOTRE_DEPOT_GITHUB]
    cd generative-medical-tutor
    ```

2.  **Lancez l'environnement avec Docker Compose :**
    Cette commande va construire les images Docker pour le backend et le frontend, et démarrer tous les conteneurs (y compris la base de données).
    ```bash
    docker-compose up --build
    ```
    La première exécution peut prendre plusieurs minutes.

3.  **Accédez aux services :**
    *   **Frontend (Application Apprenant/Expert) :** [http://localhost:3000](http://localhost:3000)
    *   **Backend (API Django) :** [http://localhost:8000](http://localhost:8000)
    *   **Documentation de l'API (Swagger) :** (à configurer)
    *   **Interface d'administration Django :** [http://localhost:8000/admin/](http://localhost:8000/admin/)

## 🛠️ Stack Technologique

*   **Backend :** Python, Django, Django REST Framework
*   **Frontend :** Next.js, TypeScript, React, Tailwind CSS
*   **Bases de Données :** PostgreSQL (relationnel), ChromaDB/Faiss (vectoriel)
*   **IA & Orchestration :** LangChain, Hugging Face Transformers
*   **Déploiement :** Docker

##  Contribution

Pour contribuer au projet, veuillez suivre ce workflow :

1.  Créez une nouvelle branche à partir de `main` : `git checkout -b feature/nom-de-la-feature`.
2.  Effectuez vos modifications et commitez votre travail.
3.  Poussez votre branche sur le dépôt distant : `git push origin feature/nom-de-la-feature`.
4.  Ouvrez une **Pull Request** sur GitHub pour revue.
5.  Une fois la revue approuvée, votre branche sera fusionnée dans `main`.

---
```

---

## 🎨 Frontend (Next.js)

### 📄 `frontendv3\app\dashboard\page.tsx`

```tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Composants UI
import { Navbar } from '@/components/layout/Navbar';
import { CaseCard } from '@/components/ui/CaseCard';
import { SessionCard } from '@/components/ui/SessionCard';
import { Modal } from '@/components/ui/Modal';
import { SkillsRadar } from '@/components/dashboard/SkillsRadar'; // <--- NOUVEAU COMPOSANT

// Icônes
import { Search, Sparkles, Stethoscope, LayoutGrid, History, Play, Activity } from 'lucide-react';

// Interfaces
interface Category {
    id: number;
    name: string;
}

interface ClinicalCase {
    id: number;
    case_title: string;
    case_summary: string;
    difficulty: 'Facile' | 'Moyen' | 'Difficile';
    categories: Category[];
}

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();

    // --- ÉTATS DONNÉES ---
    const [cases, setCases] = useState<ClinicalCase[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any>(null); // Pour le Radar

    // --- ÉTATS UI ---
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'explore' | 'history'>('explore');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [startingSim, setStartingSim] = useState(false);

    // --- ÉTATS MODALE ---
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [conflictData, setConflictData] = useState<{caseId: number, sessionId: number} | null>(null);

    // --- CHARGEMENT ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // On charge tout en parallèle : User (pour les stats), Cas, Catégories, Sessions
                const [userRes, casesRes, catsRes, sessionsRes] = await Promise.all([
                    api.get('/users/me/'),
                    api.get('/cases/'),
                    api.get('/categories/'),
                    api.get('/simulations/')
                ]);

                setUserStats(userRes.data.skill_matrix);
                setCases(casesRes.data);
                setCategories(catsRes.data);
                setSessions(sessionsRes.data);
            } catch (error) {
                console.error("Erreur de chargement", error);
                toast.error("Impossible de charger les données du tableau de bord.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- ACTIONS SIMULATION ---
    const handleStartSimulation = async (caseId?: number) => {
        setStartingSim(true);
        const toastLoading = toast.loading("Préparation du patient...");

        try {
            const payload = caseId ? { case_id: caseId } : {};
            const res = await api.post('/simulations/start/', payload);

            toast.dismiss(toastLoading);

            if (res.status === 200) {
                // Conflit : Session existante
                setConflictData({ caseId: caseId!, sessionId: res.data.id });
                setIsConflictModalOpen(true);
            } else {
                // Succès : Nouvelle session
                router.push(`/simulation/${res.data.id}`);
            }
        } catch (error) {
            toast.dismiss(toastLoading);
            toast.error("Erreur lors du démarrage.");
        } finally {
            setStartingSim(false);
        }
    };

    const confirmResume = () => {
        if (conflictData) {
            setIsConflictModalOpen(false);
            router.push(`/simulation/${conflictData.sessionId}`);
        }
    };

    const confirmRestart = async () => {
        if (!conflictData) return;
        setIsConflictModalOpen(false);
        const toastId = toast.loading("Réinitialisation...");

        try {
            const payload = { case_id: conflictData.caseId, force_new: true };
            const res = await api.post('/simulations/start/', payload);
            toast.dismiss(toastId);
            router.push(`/simulation/${res.data.id}`);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Erreur redémarrage.");
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        if(!confirm("Supprimer cette session de l'historique ?")) return;
        try {
            await api.delete(`/simulations/${sessionId}/`);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            toast.success("Session supprimée.");
        } catch (error) {
            toast.error("Erreur suppression.");
        }
    };

    // --- FILTRAGE ---
    const filteredCases = cases.filter(c => {
        const matchesCategory = selectedCategory ? c.categories.some((cat:any) => cat.name === selectedCategory) : true;
        const matchesSearch = c.case_title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- SECTION SUPÉRIEURE (HERO + RADAR) --- */}
                <div className="mb-10 animate-slide-up">
                    <h1 className="text-3xl font-extrabold text-brand-dark mb-6">
                        Bonjour, <span className="text-brand-primary">{user?.username}</span> 👋
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 1. HERO BANNER (Prend 2 colonnes sur grand écran) */}
                        <div
                            onClick={() => handleStartSimulation()}
                            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-brand-dark text-white p-8 md:p-10 shadow-2xl shadow-brand-primary/10 group cursor-pointer transition-transform hover:scale-[1.005] flex flex-col justify-center min-h-[280px]"
                        >
                            {/* Effets de fond */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary rounded-full mix-blend-screen filter blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-4 border border-brand-primary/20">
                                        <Sparkles size={14} /> Mode Aléatoire
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                                        Prêt pour la <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-400">Garde de Nuit ?</span>
                                    </h2>
                                    <p className="text-gray-400 max-w-md text-sm md:text-base mb-6">
                                        Un patient arrive aux urgences. Vous ne connaissez rien de lui. Testez vos réflexes cliniques en conditions réelles.
                                    </p>
                                    <button className="bg-white text-brand-dark px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg w-full md:w-auto justify-center">
                                        {startingSim ? 'Lancement...' : 'Prendre le patient'} <Stethoscope size={18} />
                                    </button>
                                </div>
                                {/* Illustration Iconographique */}
                                <div className="hidden md:block opacity-90 group-hover:rotate-6 transition-transform duration-500 bg-white/5 p-6 rounded-full backdrop-blur-sm border border-white/10">
                                    <Activity className="text-brand-primary h-16 w-16" />
                                </div>
                            </div>
                        </div>

                        {/* 2. RADAR CHART (Prend 1 colonne) */}
                        <div className="lg:col-span-1 h-full min-h-[280px]">
                            <SkillsRadar skillMatrix={userStats} />
                        </div>
                    </div>
                </div>

                {/* --- NAVIGATION SECONDAIRE (ONGLETS) --- */}
                <div className="flex items-center justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm inline-flex">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                activeTab === 'explore'
                                    ? 'bg-brand-dark text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <LayoutGrid size={16} /> Bibliothèque
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                activeTab === 'history'
                                    ? 'bg-brand-dark text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <History size={16} /> Mes Sessions
                            {sessions.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'history' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                            {sessions.length}
                        </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- CONTENU DYNAMIQUE --- */}

                {/* TAB 1 : EXPLORER */}
                {activeTab === 'explore' && (
                    <div className="animate-fade-in">
                        {/* Filtres */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${!selectedCategory ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    Tout
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${selectedCategory === cat.name ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Grille Cases */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-white rounded-xl animate-pulse border border-gray-100"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCases.map((c) => (
                                    <CaseCard
                                        key={c.id}
                                        title={c.case_title}
                                        summary={c.case_summary}
                                        category={c.categories && c.categories.length > 0 ? c.categories[0].name : "Général"}
                                        difficulty={c.difficulty}
                                        onClick={() => handleStartSimulation(c.id)}
                                    />
                                ))}
                                {filteredCases.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <Search className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                        <p>Aucun cas ne correspond à votre recherche.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2 : HISTORIQUE */}
                {activeTab === 'history' && (
                    <div className="animate-fade-in">
                        {sessions.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <History size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Aucune session</h3>
                                <p className="text-gray-500 text-sm mt-1">Lancez une simulation pour commencer votre historique.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sessions.map((session) => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        onResume={() => router.push(`/simulation/${session.id}`)}
                                        onDelete={() => handleDeleteSession(session.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- MODALE --- */}
                <Modal
                    isOpen={isConflictModalOpen}
                    onClose={() => setIsConflictModalOpen(false)}
                    title="Simulation déjà en cours"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600 text-sm">
                            Vous avez déjà une session active pour ce cas clinique. Vous pouvez la reprendre ou tout recommencer.
                        </p>

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={confirmResume}
                                className="w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={18} fill="currentColor" /> Reprendre la session
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-300 text-xs uppercase font-bold">ou</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>

                            <button
                                onClick={confirmRestart}
                                className="w-full py-3 bg-white border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:border-red-100 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                                Recommencer à zéro
                            </button>
                        </div>
                    </div>
                </Modal>

            </main>
        </div>
    );
}
```

### 📄 `frontendv3\app\expert\cases\[id]\page.tsx`

```tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ReasoningGraph } from '@/components/expert/ReasoningGraph';

// Icônes
import {
    ArrowLeft, Save, CheckCircle, XCircle,
    User, Activity, Plane, Wine, Dumbbell, Home,
    Stethoscope, FileText, Pill, Microscope, Eye,
    Bot, Brain, Tag, Baby, AlertTriangle, Scissors
} from 'lucide-react';

export default function CaseDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- CHARGEMENT ---
    useEffect(() => {
        const fetchCase = async () => {
            try {
                const res = await api.get(`/cases/${id}/`);
                setCaseData(res.data);
            } catch (error) {
                toast.error("Erreur de chargement.");
                router.push('/expert');
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id, router]);

    // --- GESTION DES MODIFICATIONS ---
    const handleChange = (field: string, value: any) => {
        setCaseData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleModeDeVieChange = (category: string, field: string, value: string) => {
        setCaseData((prev: any) => ({
            ...prev,
            mode_de_vie: {
                ...prev.mode_de_vie,
                [category]: {
                    ...prev.mode_de_vie?.[category],
                    [field]: value
                }
            }
        }));
    };

    // --- SAUVEGARDE ---
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch(`/cases/${id}/`, caseData);
            toast.success("Dossier mis à jour !");
        } catch (error) {
            toast.error("Erreur sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.patch(`/cases/${id}/`, { status: newStatus });
            setCaseData((prev: any) => ({ ...prev, status: newStatus }));
            toast.success(`Statut : ${newStatus}`);
        } catch (error) { toast.error("Erreur statut"); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
    if (!caseData) return null;

    return (
        <div className="space-y-8 pb-20">

            {/* --- HEADER --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/expert')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-brand-dark">{caseData.case_title}</h1>
                        <div className="flex flex-wrap gap-2 text-xs mt-2 items-center">
                            <span className="px-2 py-0.5 bg-gray-100 rounded font-mono border border-gray-200">ID: {caseData.source_fultang_id}</span>

                            {caseData.categories?.map((cat: any) => (
                                <span key={cat.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded flex items-center gap-1">
                            <Tag size={10} /> {cat.name}
                        </span>
                            ))}

                            <span className={`px-2 py-0.5 font-bold rounded uppercase border ${caseData.status === 'approuve' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        {caseData.status}
                    </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {caseData.status !== 'approuve' && (
                        <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusChange('approuve')}>
                            <CheckCircle size={18} className="mr-2"/> Valider
                        </Button>
                    )}
                    <Button onClick={handleSave} isLoading={saving} className="bg-brand-dark text-white hover:bg-gray-800">
                        <Save size={18} className="mr-2"/> Enregistrer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* === COLONNE GAUCHE (33%) === */}
                <div className="xl:col-span-4 space-y-6">

                    {/* 1. DONNÉES PERSONNELLES */}
                    <Section title="Données Personnelles" icon={User}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="Âge" type="number" value={caseData.age} onChange={(e) => handleChange('age', e.target.value)} />
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Sexe</label>
                                <select className="w-full px-4 py-3.5 rounded-xl border bg-gray-50 outline-none focus:border-brand-primary" value={caseData.sexe} onChange={(e) => handleChange('sexe', e.target.value)}>
                                    <option value="Homme">Homme</option>
                                    <option value="Femme">Femme</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="État Civil" value={caseData.etat_civil || ''} onChange={(e) => handleChange('etat_civil', e.target.value)} />
                            <Input label="Profession" value={caseData.profession || ''} onChange={(e) => handleChange('profession', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Enfants" type="number" value={caseData.nombre_enfant || 0} onChange={(e) => handleChange('nombre_enfant', e.target.value)} />
                            <Input label="Gr. Sanguin" value={caseData.groupe_sanguin || ''} onChange={(e) => handleChange('groupe_sanguin', e.target.value)} placeholder="Ex: O+" />
                        </div>
                    </Section>

                    {/* 2. MODE DE VIE */}
                    <Section title="Mode de Vie" icon={Home}>
                        <div className="mb-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-800 font-bold text-[10px] mb-2 uppercase"><Plane size={12}/> Voyage</div>
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-mini" placeholder="Lieu" value={caseData.mode_de_vie?.voyage?.lieu || ''} onChange={(e) => handleModeDeVieChange('voyage', 'lieu', e.target.value)} />
                                <input className="input-mini" placeholder="Fréquence" value={caseData.mode_de_vie?.voyage?.frequence || ''} onChange={(e) => handleModeDeVieChange('voyage', 'frequence', e.target.value)} />
                                <input className="input-mini col-span-2" placeholder="Durée" value={caseData.mode_de_vie?.voyage?.duree || ''} onChange={(e) => handleModeDeVieChange('voyage', 'duree', e.target.value)} />
                            </div>
                        </div>
                        <div className="mb-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2 text-red-800 font-bold text-[10px] mb-2 uppercase"><Wine size={12}/> Addictions</div>
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-mini" placeholder="Nom" value={caseData.mode_de_vie?.addiction?.nom || ''} onChange={(e) => handleModeDeVieChange('addiction', 'nom', e.target.value)} />
                                <input className="input-mini" placeholder="Fréquence" value={caseData.mode_de_vie?.addiction?.frequence || ''} onChange={(e) => handleModeDeVieChange('addiction', 'frequence', e.target.value)} />
                                <input className="input-mini col-span-2" placeholder="Durée" value={caseData.mode_de_vie?.addiction?.duree || ''} onChange={(e) => handleModeDeVieChange('addiction', 'duree', e.target.value)} />
                            </div>
                        </div>
                        <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 text-green-800 font-bold text-[10px] mb-2 uppercase"><Dumbbell size={12}/> Activité Physique</div>
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-mini" placeholder="Activité" value={caseData.mode_de_vie?.sport?.nom || ''} onChange={(e) => handleModeDeVieChange('sport', 'nom', e.target.value)} />
                                <input className="input-mini" placeholder="Fréquence" value={caseData.mode_de_vie?.sport?.frequence || ''} onChange={(e) => handleModeDeVieChange('sport', 'frequence', e.target.value)} />
                            </div>
                        </div>
                    </Section>

                    {/* 3. IA CONFIG */}
                    <Section title="Configuration IA" icon={Bot}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><User size={12}/> Prompt Patient</label>
                                <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-900 text-green-400 font-mono text-[10px] min-h-[100px] outline-none" value={caseData.system_prompt_patient || ''} onChange={(e) => handleChange('system_prompt_patient', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Brain size={12}/> Prompt Tuteur</label>
                                <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-900 text-yellow-400 font-mono text-[10px] min-h-[100px] outline-none" value={caseData.system_prompt_tutor || ''} onChange={(e) => handleChange('system_prompt_tutor', e.target.value)} />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* === COLONNE DROITE (66%) === */}
                <div className="xl:col-span-8 space-y-6">

                    {/* MOTIF CONSULTATION */}
                    <div className="bg-white p-6 rounded-xl border border-brand-primary/20 shadow-sm">
                        <label className="text-xs font-bold text-brand-primary mb-2 block uppercase tracking-wider">Motif de Consultation</label>
                        <textarea
                            className="w-full text-xl font-medium text-brand-dark bg-transparent border-none outline-none resize-none placeholder-gray-300"
                            rows={2}
                            value={caseData.motif_consultation || ''}
                            onChange={(e) => handleChange('motif_consultation', e.target.value)}
                        />
                    </div>

                    {/* GRAPHE */}
                    <Section title="Logique IA (Graphe)" icon={Activity}>
                        <ReasoningGraph data={caseData.reasoning_graph} />
                    </Section>

                    {/* SYMPTÔMES (8 Attributs) */}
                    <Section title="Symptômes" icon={Activity}>
                        <div className="space-y-3">
                            {caseData.symptoms?.map((s: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex justify-between mb-3 border-b border-gray-200 pb-2">
                                        <span className="font-bold text-gray-900">{s.nom}</span>
                                        <div className="flex items-center gap-2 bg-white px-2 rounded-lg border border-gray-200">
                                            <span className="text-xs text-gray-400">Intensité</span>
                                            <span className="font-bold text-brand-primary">{s.degre}</span>
                                            <span className="text-xs text-gray-400">/10</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                        <div><span className="label-mini">Localisation</span><div className="val">{s.localisation || '-'}</div></div>
                                        <div><span className="label-mini">Début</span><div className="val">{s.date_debut || '-'}</div></div>
                                        <div><span className="label-mini">Fréquence</span><div className="val">{s.frequence || '-'}</div></div>
                                        <div><span className="label-mini">Durée</span><div className="val">{s.duree || '-'}</div></div>
                                        <div className="col-span-2"><span className="label-mini">Facteur Déclenchant</span><div className="val">{s.activite_declenchante || '-'}</div></div>
                                        <div className="col-span-2"><span className="label-mini">Évolution</span><div className="val">{s.evolution || '-'}</div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* ANTÉCÉDENTS (DÉTAILLÉS) */}
                        <Section title="Antécédents & Historique" icon={FileText}>
                            <div className="space-y-4">
                                {caseData.history_entries?.map((h: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-gray-300 transition-colors">

                                        {/* Header Antécédent */}
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                                        h.type === 'maladie' ? 'bg-orange-100 text-orange-700' :
                                            h.type === 'allergie' ? 'bg-red-100 text-red-700' :
                                                h.type === 'chirurgie' ? 'bg-blue-100 text-blue-700' :
                                                    h.type === 'obstetrical' ? 'bg-pink-100 text-pink-700' :
                                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {h.type === 'chirurgie' && <Scissors size={10} />}
                                        {h.type === 'allergie' && <AlertTriangle size={10} />}
                                        {h.type === 'obstetrical' && <Baby size={10} />}
                                        {h.type}
                                    </span>
                                            <span className="font-bold text-sm text-gray-800">{h.nom || h.description}</span>
                                        </div>

                                        {/* Corps Antécédent (Champs Spécifiques) */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">

                                            {/* CAS MALADIE */}
                                            {h.type === 'maladie' && (
                                                <>
                                                    <div><span className="label-mini">Début</span><div className="val">{h.date || '-'}</div></div>
                                                    <div><span className="label-mini">Fin</span><div className="val">{h.date_fin || '-'}</div></div>
                                                    <div className="col-span-2"><span className="label-mini">Note</span><div className="val">{h.observation || h.description}</div></div>

                                                    {/* Traitement lié */}
                                                    {h.traitement_nom && (
                                                        <div className="col-span-2 mt-2 bg-blue-50/50 p-2 rounded border border-blue-100">
                                                            <div className="flex items-center gap-1 mb-1 text-blue-800 font-bold text-[10px]"><Pill size={10}/> Traitement Lié</div>
                                                            <div className="grid grid-cols-2 gap-1">
                                                                <span className="val font-semibold">{h.traitement_nom}</span>
                                                                <span className="val text-gray-500">{h.traitement_posologie}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* CAS CHIRURGIE */}
                                            {h.type === 'chirurgie' && (
                                                <>
                                                    <div><span className="label-mini">Date</span><div className="val">{h.date || '-'}</div></div>
                                                    <div className="col-span-2"><span className="label-mini">Détail</span><div className="val">{h.description}</div></div>
                                                </>
                                            )}

                                            {/* CAS ALLERGIE */}
                                            {h.type === 'allergie' && (
                                                <>
                                                    <div className="col-span-2"><span className="label-mini">Déclencheur</span><div className="val font-bold text-red-600">{h.declencheur || h.nom}</div></div>
                                                    <div className="col-span-2"><span className="label-mini">Réaction</span><div className="val">{h.manifestation || h.description}</div></div>
                                                </>
                                            )}

                                            {/* CAS OBSTETRICAL */}
                                            {h.type === 'obstetrical' && (
                                                <>
                                                    <div><span className="label-mini">Nb Grossesses (G)</span><div className="val font-bold">{h.nombre_grossesse}</div></div>
                                                    <div><span className="label-mini">Date Dernière</span><div className="val">{h.date || '-'}</div></div>
                                                </>
                                            )}

                                            {/* CAS FAMILIAL (Défaut) */}
                                            {h.type === 'familial' && (
                                                <div className="col-span-2"><span className="label-mini">Description</span><div className="val">{h.description}</div></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* TRAITEMENT */}
                        <Section title="Traitement Actuel" icon={Pill}>
                            <div className="space-y-3">
                                {caseData.current_treatments?.map((t: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="font-bold text-gray-900">{t.nom}</div>
                                        <div className="flex justify-between text-xs mt-1">
                                            <span className="text-gray-500">{t.posologie}</span>
                                            <span className={t.efficacite?.includes('inefficace') ? 'text-red-500' : 'text-green-500'}>{t.efficacite}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* EXAMENS & DIAGNOSTICS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Signes Physiques & Examens" icon={Microscope}>
                            <div className="space-y-4">
                                {/* Signes Physiques */}
                                {caseData.physical_findings?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Eye size={12}/> Inspection / Palpation</h4>
                                        {caseData.physical_findings.map((p: any, idx: number) => (
                                            <div key={idx} className="text-xs border-l-2 border-brand-primary pl-2 py-1 mb-1">
                                                <span className="font-bold text-gray-700">{p.nom_examen} : </span>
                                                <span className="text-gray-600">{p.resultat_observation}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Examens avec Anatomie */}
                                {caseData.exams?.map((e: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-brand-dark">{e.nom}</span>

                                            {/* Badge Anatomie */}
                                            {e.anatomie && (
                                                <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 uppercase font-bold">
                                            {e.anatomie}
                                        </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 mt-1 font-medium">
                                            {e.resultat}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="Diagnostics" icon={Stethoscope}>
                            {caseData.diagnoses?.map((d: any, idx: number) => (
                                <div key={idx} className={`p-3 rounded-lg border mb-2 ${d.is_final ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-800 text-sm">{d.description}</span>
                                        {d.is_final ? (
                                            <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Final</span>
                                        ) : (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Différentiel</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Section>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .input-mini { width: 100%; padding: 4px 8px; font-size: 11px; border: 1px solid #E5E7EB; border-radius: 4px; outline: none; }
        .input-mini:focus { border-color: #D97706; background: white; }
        .label-mini { display: block; font-size: 9px; text-transform: uppercase; color: #9CA3AF; font-weight: 700; margin-bottom: 1px; }
        .val { font-size: 12px; font-weight: 500; color: #1F2937; }
      `}</style>
        </div>
    );
}

function Section({ title, icon: Icon, children }: any) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Icon size={16} className="text-brand-primary" />
                <h3 className="font-bold text-brand-dark text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}
```

### 📄 `frontendv3\app\expert\layout.tsx`

```tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Sécurité : On vérifie que c'est bien un expert
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'EXPERT') {
                router.push('/dashboard'); // Si un étudiant essaie d'entrer, on le renvoie chez lui
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'EXPERT') {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-brand-primary" size={32}/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Menu fixe à gauche */}
            <AdminSidebar />

            {/* Contenu principal décalé vers la droite */}
            <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
```

### 📄 `frontendv3\app\expert\page.tsx`

```tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    CheckCircle, XCircle, Edit3, Download, RefreshCw,
    Database, Clock, AlertCircle, Filter, Search
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function ExpertDashboard() {
    const router = useRouter();

    // --- ÉTATS DONNÉES ---
    const [cases, setCases] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // --- ÉTATS UI ---
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);

    // --- FILTRES ---
    const [filterStatus, setFilterStatus] = useState<'non_approuve' | 'approuve' | 'rejete'>('non_approuve');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('');

    // --- MODALE DE REJET ---
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // --- 1. CHARGEMENT INITIAL ---
    useEffect(() => {
        api.get('/categories/').then(res => setCategories(res.data)).catch(console.error);
        fetchCases();
    }, []);

    // --- 2. RÉCUPÉRATION DES CAS ---
    const fetchCases = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCategory) params.append('categories', filterCategory);
            if (filterDifficulty) params.append('difficulty', filterDifficulty);

            const res = await api.get(`/cases/?${params.toString()}`);
            setCases(res.data);
        } catch (e) {
            toast.error("Erreur de chargement des cas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, [filterCategory, filterDifficulty]);


    // --- 3. ACTIONS GLOBALES ---
    const handleImport = async () => {
        setImporting(true);
        const toastId = toast.loading("Interrogation de Fultang...");
        try {
            const res = await api.post('/cases/trigger-import/');
            toast.dismiss(toastId);

            if (res.data.message.includes("Aucun nouveau")) {
                toast(res.data.message, { icon: 'ℹ️' });
            } else {
                toast.success("Nouveaux cas importés !");
                fetchCases();
            }
        } catch (e) {
            toast.dismiss(toastId);
            toast.error("Erreur lors de l'import.");
        } finally {
            setImporting(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        const toastId = toast.loading("Génération du dataset...");
        try {
            await api.post('/cases/trigger-export/');
            toast.dismiss(toastId);
            toast.success("Dataset exporté sur MinIO.");
        } catch (e) {
            toast.dismiss(toastId);
            toast.error("Erreur d'export.");
        } finally {
            setExporting(false);
        }
    };

    // --- 4. GESTION DES STATUTS ---
    const handleUpdateStatus = async (id: number, newStatus: string) => {
        if (newStatus === 'rejete') {
            setRejectingId(id);
            return;
        }
        await executeStatusUpdate(id, newStatus);
    };

    const executeStatusUpdate = async (id: number, newStatus: string, reason?: string) => {
        try {
            const payload: any = { status: newStatus };
            if (reason) payload.rejection_reason = reason;

            await api.patch(`/cases/${id}/`, payload);

            toast.success(`Cas mis à jour : ${newStatus}`);
            setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, rejection_reason: reason } : c));

            setRejectingId(null);
            setRejectReason("");
        } catch (e) {
            toast.error("Erreur technique.");
        }
    };

    const displayedCases = cases.filter(c => c.status === filterStatus);

    if (loading && cases.length === 0) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <>
            {/* HEADER ADMIN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark flex items-center gap-2">
                        <Database className="text-brand-primary" /> Administration
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Pilotage de la base de connaissances et flux de validation.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        {exporting ? <Clock className="animate-spin" size={18}/> : <Download size={18} />}
                        Exporter
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={importing}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50"
                    >
                        {importing ? <RefreshCw className="animate-spin" size={18}/> : <RefreshCw size={18} />}
                        Importer Fultang
                    </button>
                </div>
            </div>

            {/* --- STATS RAPIDES (La barre que vous vouliez) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Carte À VALIDER */}
                <div
                    onClick={() => setFilterStatus('non_approuve')}
                    className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${filterStatus === 'non_approuve' ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'}`}
                >
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">À Valider</p>
                        <p className="text-3xl font-black text-orange-500 mt-1">{cases.filter(c => c.status === 'non_approuve').length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                        <AlertCircle size={24} />
                    </div>
                </div>

                {/* Carte APPROUVÉS */}
                <div
                    onClick={() => setFilterStatus('approuve')}
                    className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${filterStatus === 'approuve' ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100'}`}
                >
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Approuvés</p>
                        <p className="text-3xl font-black text-green-600 mt-1">{cases.filter(c => c.status === 'approuve').length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <CheckCircle size={24} />
                    </div>
                </div>

                {/* Carte REJETÉS */}
                <div
                    onClick={() => setFilterStatus('rejete')}
                    className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${filterStatus === 'rejete' ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'}`}
                >
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rejetés</p>
                        <p className="text-3xl font-black text-red-500 mt-1">{cases.filter(c => c.status === 'rejete').length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-400">
                        <XCircle size={24} />
                    </div>
                </div>
            </div>

            {/* FILTRES AVANCÉS */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-wider">
                    <Filter size={16} /> Filtres :
                </div>

                <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white transition-colors outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer min-w-[200px]"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white transition-colors outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer min-w-[150px]"
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                    <option value="">Toutes difficultés</option>
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                </select>

                {(filterCategory || filterDifficulty) && (
                    <button
                        onClick={() => { setFilterCategory(''); setFilterDifficulty(''); }}
                        className="text-xs text-red-500 font-bold hover:underline ml-auto"
                    >
                        Réinitialiser
                    </button>
                )}
            </div>

            {/* BARRE D'ONGLETS (Navigation secondaire) */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                        { id: 'non_approuve', label: 'File d\'attente' },
                        { id: 'approuve', label: 'Base Active' },
                        { id: 'rejete', label: 'Corbeille' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id as any)}
                            className={`
                        whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                        ${filterStatus === tab.id
                                ? 'border-brand-primary text-brand-primary font-bold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* LISTE DES CAS */}
            <div className="space-y-4">
                {displayedCases.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        <Search className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                        Aucun cas trouvé.
                    </div>
                ) : (
                    displayedCases.map((c) => (
                        <div key={c.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wide">
                                ID: {c.source_fultang_id}
                            </span>

                                    {c.categories && c.categories.map((cat: any, index: number) => (
                                        <span key={cat.id || index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                                    {cat.name || cat}
                                </span>
                                    ))}

                                    {c.difficulty && (
                                        <span className={`px-2 py-1 text-xs font-bold rounded border ${
                                            c.difficulty === 'Difficile' ? 'bg-red-50 text-red-700 border-red-100' :
                                                c.difficulty === 'Facile' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                    {c.difficulty}
                                </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{c.case_title}</h3>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.case_summary}</p>

                                <div className="flex gap-4 text-xs text-gray-400 font-mono">
                                    <span>{c.age} ans • {c.sexe}</span>
                                </div>

                                {c.status === 'rejete' && c.rejection_reason && (
                                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700 flex items-start gap-2">
                                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                                        <div>
                                            <span className="font-bold">Motif du rejet :</span> {c.rejection_reason}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                                <button
                                    onClick={() => router.push(`/expert/cases/${c.id}`)}
                                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Edit3 size={16} /> Voir / Éditer
                                </button>

                                {c.status === 'non_approuve' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(c.id, 'approuve')}
                                            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={16} /> Approuver
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(c.id, 'rejete')}
                                            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-50 text-red-700 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={16} /> Rejeter
                                        </button>
                                    </>
                                )}

                                {c.status === 'approuve' && (
                                    <button
                                        onClick={() => handleUpdateStatus(c.id, 'non_approuve')}
                                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-orange-50 text-orange-700 text-sm font-bold rounded-lg hover:bg-orange-100 transition-colors"
                                    >
                                        <AlertCircle size={16} /> Suspendre
                                    </button>
                                )}

                                {c.status === 'rejete' && (
                                    <button
                                        onClick={() => handleUpdateStatus(c.id, 'non_approuve')}
                                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <RefreshCw size={16} /> Restaurer
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODALE DE REJET */}
            <Modal
                isOpen={!!rejectingId}
                onClose={() => { setRejectingId(null); setRejectReason(""); }}
                title="Rejeter ce cas"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100 flex gap-2">
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        Vous êtes sur le point de rejeter ce cas. Merci d'indiquer la raison pour aider nos équipes.
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Motif du rejet</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none text-sm resize-none"
                            placeholder="Ex: Données cliniques incohérentes, diagnostic erroné, manque de détails..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => { setRejectingId(null); setRejectReason(""); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => rejectingId && executeStatusUpdate(rejectingId, 'rejete', rejectReason)}
                            disabled={!rejectReason.trim()}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            Confirmer le rejet
                        </button>
                    </div>
                </div>
            </Modal>

        </>
    );
}
```

### 📄 `frontendv3\app\globals.css`

```css
@import "tailwindcss";

@theme {
    /* --- COULEURS --- */
    --color-brand-dark: #111827;
    --color-brand-primary: #D97706;
    --color-brand-primary-hover: #b45309;
    --color-brand-light: #F9FAFB;
    --color-brand-secondary: #60A5FA;
    --color-brand-success: #34D399;
    --color-brand-error: #F87171;
    --color-brand-text: #374151;
    --color-brand-muted: #6B7280;

    /* --- POLICE --- */
    --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

    /* --- OMBRES --- */
    --shadow-default: 0 2px 10px rgba(0, 0, 0, 0.07);

    /* --- ANIMATIONS & KEYFRAMES --- */
    /* Tailwind v4 détecte automatiquement les keyframes si elles sont préfixées par --animate */
    --animate-fade-in: fadeIn 0.3s ease-out forwards;
    --animate-slide-up: slideUp 0.3s ease-out forwards;
    --animate-blob: blob 7s infinite;

    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    @keyframes slideUp {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
}

/* --- TES STYLES RACINES --- */
:root {
    --foreground-rgb: 55, 65, 81; /* brand-text */
    --background-start-rgb: 249, 250, 251; /* brand-light */
    --background-end-rgb: 255, 255, 255;
}

body {
    color: var(--color-brand-text);
    background: white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* --- TES UTILITAIRES MANUELS --- */
@utility animation-delay-2000 {
    animation-delay: 2s;
}
@utility animation-delay-4000 {
    animation-delay: 4s;
}

/* --- CUSTOM DRIVER.JS (CORRECTIF VISIBILITÉ) --- */

/* 1. L'Overlay (Le fond sombre) */
.driver-overlay {
    background-color: rgba(15, 23, 42, 0.75) !important; /* Bleu nuit sombre */
    /* On enlève le blur qui peut causer le bug visuel "grisé" sur l'élément cible */
    backdrop-filter: none !important;
    z-index: 100000 !important;
}

/* 2. L'élément mis en surbrillance (C'est lui qui posait problème) */
.driver-active-element {
    /* On le force à passer au-dessus de l'overlay */
    position: relative !important;
    z-index: 100001 !important;

    /* On lui force un fond blanc (sinon s'il est transparent, il parait sombre) */
    background-color: white !important;

    /* On réapplique le joli halo orange */
    outline: none !important; /* On enlève l'outline par défaut du navigateur */
    box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.5), 0 0 20px rgba(0,0,0,0.2) !important;
    border-radius: 12px !important;
}

/* 3. La Boîte de texte (Popover) */
.driver-popover {
    background-color: white !important;
    border-radius: 16px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2) !important; /* Ombre plus forte */
    padding: 24px !important;
    max-width: 400px !important;
    color: #334155 !important;
    font-family: var(--font-inter), sans-serif !important;
    z-index: 100002 !important; /* Au-dessus de tout */
}

/* ... Le reste (Titre, Boutons) reste identique à ce que je vous ai donné avant ... */
.driver-popover-title {
    font-size: 18px !important;
    font-weight: 800 !important;
    color: #0F172A !important;
    margin-bottom: 12px !important;
}

.driver-popover-description {
    font-size: 14px !important;
    line-height: 1.6 !important;
    color: #64748b !important;
    margin-bottom: 24px !important;
}

.driver-popover-footer {
    display: flex !important;
    justify-content: flex-end !important;
    gap: 8px !important;
}

/* Bouton Suivant (Orange) */
.driver-popover-next-btn {
    background-color: #D97706 !important;
    color: white !important;
    border: none !important;
    padding: 10px 24px !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    text-shadow: none !important;
}

/* Bouton Précédent (Gris) */
.driver-popover-prev-btn {
    background-color: #f1f5f9 !important;
    color: #64748b !important;
    border: none !important;
    padding: 10px 20px !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    text-shadow: none !important;
}
```

### 📄 `frontendv3\app\layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import {Toaster} from "react-hot-toast"; // Importez le provider

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
    title: "MedTutor AI",
    description: "Formation médicale par simulation",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
        <body className={inter.className}>
        <AuthProvider>
            {children}
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </AuthProvider>
        </body>
        </html>
    );
}
```

### 📄 `frontendv3\app\login\page.tsx`

```tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/users/token/', { username, password });
            login(response.data.access, response.data.refresh);
        } catch (err: any) {
            setError('Identifiants incorrects ou erreur serveur.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Bon retour parmi nous"
            subtitle="Connectez-vous pour accéder à vos simulations médicales."
        >
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">

                {/* Affichage des erreurs */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-slide-up">
                        {error}
                    </div>
                )}

                {/* Formulaire + Icônes */}
                <div className="space-y-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User size={16} /></span>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nom d'utilisateur"
                            required
                            className="pl-10"
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></span>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                            className="pl-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Link href="#" className="text-xs font-medium text-brand-primary hover:text-brand-primaryHover">
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bouton d'action */}
                <div className="pt-2">
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Se connecter
                    </Button>
                </div>

                {/* Lien vers l'inscription */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="font-medium text-brand-primary hover:text-brand-primaryHover">
                        Créer un compte étudiant
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
```

### 📄 `frontendv3\app\page.tsx`

```tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                if (user.role === 'EXPERT') {
                    router.push('/expert');
                } else {
                    router.push('/dashboard');
                }
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    // Affiche un écran de chargement minimaliste pendant la redirection
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-brand-primary rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\app\register\page.tsx`

```tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, User } from 'lucide-react'; // Importer les icônes

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/users/register/', {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName
            });

            router.push('/login?registered=true');
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.username) {
                setError("Ce nom d'utilisateur est déjà pris.");
            } else if (err.response?.data?.email) {
                setError("Cette adresse email est déjà utilisée.");
            } else {
                setError("Une erreur est survenue lors de l'inscription.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Rejoignez notre communauté"
            subtitle="Créez votre compte pour accéder aux simulations médicales."
        >
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-slide-up">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" required />
                    <Input label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" required />
                </div>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></span>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean.dupont@med.univ"
                        required
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User size={16} /></span>
                    <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="jeandupont"
                        required
                        className="pl-10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Mot de passe"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                    <Input
                        label="Confirmation"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Créer mon compte
                    </Button>
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="font-medium text-brand-primary hover:text-brand-primaryHover">
                        Se connecter
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
```

### 📄 `frontendv3\app\simulation\[id]\page.tsx`

```tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Composants UI
import { PatientMonitor, VitalsData } from '@/components/simulation/PatientMonitor';
import { ChatBubble } from '@/components/simulation/ChatBubble';
import { SimulationWorkspace } from '@/components/simulation/SimulationWorkspace';
import { MentorSidecar } from '@/components/simulation/MentorSidecar';
import { ClinicalDecision } from '@/components/simulation/ClinicalDecision';
import { Modal } from '@/components/ui/Modal';

// Hook Tutoriel
import { useSimulationTour } from '@/hooks/useSimulationTour';

// Icônes
import { Send, Loader2, User, Stethoscope, HelpCircle, Gavel } from 'lucide-react';

export default function SimulationPage() {
    const { id } = useParams();
    const router = useRouter();

    // --- ÉTATS DONNÉES ---
    const [messages, setMessages] = useState<any[]>([]);
    const [caseInfo, setCaseInfo] = useState<any>(null);

    // --- ÉTATS UI ---
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState("");
    const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false); // Modale Diagnostic

    // --- ÉTATS WORKSPACE & MONITEUR ---
    const [notes, setNotes] = useState("");
    const [lastTutorMsgCount, setLastTutorMsgCount] = useState(0);
    const [vitals, setVitals] = useState<VitalsData>({});

    // --- ÉTAT DU TOUR ---
    const [runTour, setRunTour] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Lancement du tour interactif
    useSimulationTour(runTour, setRunTour);

    // --- LOGIQUE D'EXTRACTION DES CONSTANTES (REGEX) ---
    const updateVitalsFromMessage = (content: string) => {
        const newVitals: VitalsData = {};

        const taMatch = content.match(/(?:TA|Tension|BP|Pression)\s*[:=]?\s*(\d{2,3}\/\d{2,3})/i);
        if (taMatch) newVitals.ta = taMatch[1];

        const fcMatch = content.match(/(?:FC|Fréquence Cardiaque|Pouls|Pulse|HR)\s*[:=]?\s*(\d{2,3})/i);
        if (fcMatch) newVitals.fc = fcMatch[1];

        const tempMatch = content.match(/(?:Température|Temp|T°)\s*[:=]?\s*(\d{2}(?:[\.,]\d)?)/i);
        if (tempMatch) newVitals.temp = tempMatch[1].replace(',', '.');

        const spo2Match = content.match(/(?:SpO2|Saturation|Sat)\s*[:=]?\s*(\d{2,3})/i);
        if (spo2Match) newVitals.spo2 = spo2Match[1];

        const frMatch = content.match(/(?:FR|Fréquence Respiratoire|Resp)\s*[:=]?\s*(\d{2})/i);
        if (frMatch) newVitals.fr = frMatch[1];

        const glycMatch = content.match(/(?:Glycémie|Dextro|Sucre)\s*[:=]?\s*([\d\.,]+)/i);
        if (glycMatch) newVitals.glyc = glycMatch[1].replace(',', '.');

        if (Object.keys(newVitals).length > 0) {
            setVitals(prev => ({ ...prev, ...newVitals }));
        }
    };

    // --- CHARGEMENT INITIAL ---
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/simulations/${id}/`);
                setMessages(res.data.messages);
                setCaseInfo(res.data.case);

                // Repeupler le moniteur si on revient sur la page
                res.data.messages.forEach((msg: any) => {
                    if (msg.sender === 'PATIENT_IA') updateVitalsFromMessage(msg.content);
                });

                setLoading(false);

                // Auto-start du tour
                const hasSeenTour = localStorage.getItem('hasSeenSimulationTour');
                if (!hasSeenTour) {
                    setTimeout(() => setRunTour(true), 1500);
                    localStorage.setItem('hasSeenSimulationTour', 'true');
                }

            } catch (error) {
                toast.error("Impossible de charger la simulation");
                router.push('/dashboard');
            }
        };
        fetchSession();
    }, [id, router]);

    // --- SCROLL AUTO ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- FILTRAGE MESSAGES ---
    const chatMessages = messages.filter((m: any) => m.sender !== 'TUTEUR');

    // Logique Mentor Sidecar
    const tutorMessages = messages.filter((m: any) => m.sender === 'TUTEUR');
    const lastTutorMessage = tutorMessages.length > 0 ? tutorMessages[tutorMessages.length - 1] : null;
    const tutorContent = lastTutorMessage ? lastTutorMessage.content.replace('🤔 Question du Mentor :', '').trim() : null;
    const tutorId = lastTutorMessage ? lastTutorMessage.id : null;

    const hasNewTutorMessage = tutorMessages.length > lastTutorMsgCount;
    useEffect(() => { setLastTutorMsgCount(tutorMessages.length); }, [tutorMessages.length]);

    // --- HANDLER MESSAGE TEXTE ---
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || sending) return;

        const userMsgContent = input;
        setInput("");
        setSending(true);

        const tempMsg = { id: Date.now(), sender: 'APPRENANT', content: userMsgContent };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await api.post(`/simulations/${id}/message/`, { content: userMsgContent });
            const aiMsg = res.data;
            setMessages(prev => [...prev, aiMsg]);

            if (aiMsg.sender === 'PATIENT_IA') updateVitalsFromMessage(aiMsg.content);

            // Refresh pour le tuteur
            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

        } catch (error) {
            toast.error("Erreur d'envoi");
        } finally {
            setSending(false);
        }
    };

    // --- HANDLER ACTION CLINIQUE ---
    const handleClinicalAction = async (category: string, actionName: string) => {
        if (sending) return;
        setSending(true);

        const tempMsg = {
            id: Date.now(),
            sender: 'APPRENANT',
            content: `🩺 EXAMEN : ${actionName} (${category})`
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await api.post(`/simulations/${id}/message/`, { content: `[ACTION] ${category} > ${actionName}` });
            const aiMsg = res.data;

            setMessages(prev => [...prev, aiMsg]);
            updateVitalsFromMessage(aiMsg.content);

            // Refresh pour le tuteur
            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

        } catch (error) {
            toast.error("Erreur action clinique");
        } finally {
            setSending(false);
        }
    };

    // --- FIN DE SESSION SIMPLE ---
    const handleExit = async () => {
        if(!confirm("Quitter sans valider le diagnostic ?")) return;
        router.push('/dashboard');
    };

    // --- FIN DE SESSION AVEC DIAGNOSTIC (MODALE) ---
    const handleFinalDiagnose = async (diagnosis: string, prescription: string) => {
        setIsDecisionModalOpen(false);
        const toastId = toast.loading("Analyse de votre diagnostic...");

        try {
            // 1. Envoi du diagnostic comme message système
            await api.post(`/simulations/${id}/message/`, {
                content: `[DIAGNOSTIC FINAL] : ${diagnosis}. [TRAITEMENT] : ${prescription}`
            });

            // 2. Clôture et génération rapport
            await api.post(`/simulations/${id}/finish/`);

            toast.dismiss(toastId);
            toast.success("Terminé !");
            router.push(`/simulation/${id}/report`);

        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Erreur technique");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32}/></div>;

    return (
        <div className="h-screen flex flex-col bg-brand-light overflow-hidden">

            {/* 1. HEADER MONITEUR (Tour: #tour-header-patient) */}
            <div id="tour-header-patient">
                <PatientMonitor
                    caseTitle={caseInfo?.case_title}
                    patientInfo={{ age: caseInfo?.age || 0, sexe: caseInfo?.sexe || 'Inconnu' }}
                    vitals={vitals}
                    onExit={handleExit}
                />
            </div>

            <div className="flex flex-1 overflow-hidden relative">

                {/* COLONNE GAUCHE : CHAT (Tour: #tour-chat-area) */}
                <div id="tour-chat-area" className="flex-1 flex flex-col relative bg-[#F8F9FC]">

                    {/* Bouton Aide */}
                    <button
                        onClick={() => setRunTour(true)}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur text-brand-primary rounded-full shadow-sm hover:bg-white transition-all"
                        title="Relancer le tutoriel"
                    >
                        <HelpCircle size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
                        <div className="max-w-3xl mx-auto pb-4">

                            {/* Sidecar Mentor (Tour: #tour-mentor-sidecar) */}
                            <div className="sticky top-0 z-10 pointer-events-none">
                                <div className="pointer-events-auto">
                                    <MentorSidecar adviceId={tutorId} adviceContent={tutorContent} />
                                </div>
                            </div>

                            <div className="flex justify-center my-8">
                        <span className="bg-white border border-gray-200 text-gray-400 text-xs px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                            <Stethoscope size={12} /> Début de la consultation
                        </span>
                            </div>

                            {chatMessages.map((msg: any) => (
                                <ChatBubble key={msg.id} sender={msg.sender} content={msg.content} />
                            ))}

                            {sending && (
                                <div className="flex gap-3 justify-start mb-4 animate-fade-in">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                                        <User size={16} />
                                    </div>
                                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* BOUTON FLOTTANT DIAGNOSTIC (Nouveau) */}
                    <div className="absolute bottom-24 right-6 z-30">
                        <button
                            onClick={() => setIsDecisionModalOpen(true)}
                            className="group flex items-center gap-3 pl-4 pr-5 py-3.5 bg-gradient-to-r from-brand-primary to-orange-600 text-white rounded-full shadow-2xl shadow-brand-primary/40 hover:scale-105 hover:shadow-brand-primary/60 transition-all duration-300"
                        >
                            <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-12 transition-transform">
                                <Gavel size={20} className="text-white" />
                            </div>
                            <span className="font-bold text-sm tracking-wide">POSER LE DIAGNOSTIC</span>
                        </button>
                    </div>

                    {/* Input Zone */}
                    <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 shrink-0">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSend} className="relative flex items-center gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez une question au patient..."
                                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none text-brand-dark"
                                    autoFocus
                                    disabled={sending}
                                />
                                <button type="submit" disabled={!input.trim() || sending} className="p-3.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primaryHover disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : WORKSPACE (Tour: IDs inclus dans le composant) */}
                <SimulationWorkspace
                    onAction={handleClinicalAction}
                    disabled={sending}
                    messages={messages}
                    notes={notes}
                    setNotes={setNotes}
                    hasNewTutorMessage={hasNewTutorMessage}
                    onDiagnose={() => {}} // Non utilisé car déplacé dans la modale, mais gardé pour compatibilité prop
                />

            </div>

            {/* MODALE DE DÉCISION CLINIQUE */}
            <Modal
                isOpen={isDecisionModalOpen}
                onClose={() => setIsDecisionModalOpen(false)}
                title="Conclusion Clinique"
            >
                <ClinicalDecision
                    onDiagnose={handleFinalDiagnose}
                    onCancel={() => setIsDecisionModalOpen(false)}
                />
            </Modal>

        </div>
    );
}
```

### 📄 `frontendv3\app\simulation\[id]\report\page.tsx`

```tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { ReasoningGraph } from '@/components/expert/ReasoningGraph';
import {
    Trophy, XCircle, CheckCircle, ArrowRight,
    Activity, Brain, ListChecks, RotateCcw
} from 'lucide-react';

export default function ReportPage() {
    const { id } = useParams();
    const router = useRouter();

    const [report, setReport] = useState<any>(null);
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // On récupère le rapport ET les données du cas (pour le graphe)
                const resReport = await api.get(`/simulations/${id}/results/`);
                setReport(resReport.data);

                // On a besoin du cas pour afficher le graphe de correction
                const resCase = await api.get(`/cases/${resReport.data.session_case_id || resReport.data.case_id}/`); // Adapter selon votre serializer
                setCaseData(resCase.data);

            } catch (error) {
                console.error("Erreur chargement", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-brand-light">Analyse des performances...</div>;
    if (!report) return <div className="h-screen flex items-center justify-center">Rapport introuvable.</div>;

    const isSuccess = report.score_global >= 50;

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* --- HEADER : SCORE & VERDICT --- */}
                <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-gray-100 mb-8 text-center md:text-left">
                    {/* Arrière-plan décoratif */}
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/4 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">
                                <Activity size={14} /> Rapport de fin de session
                            </div>
                            <h1 className="text-4xl font-extrabold text-brand-dark mb-2">
                                {isSuccess ? "Bien joué !" : "Diagnostic manqué."}
                            </h1>
                            <p className="text-lg text-gray-500 max-w-lg">
                                {report.diagnostic_found
                                    ? "Vous avez correctement identifié la pathologie principale."
                                    : "Vous n'avez pas formulé le bon diagnostic final."}
                            </p>
                        </div>

                        {/* Cercle de Score */}
                        <div className="flex flex-col items-center">
                            <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-8 ${isSuccess ? 'border-green-100 text-green-600' : 'border-red-100 text-red-600'}`}>
                                <span className="text-4xl font-black">{report.score_global}</span>
                                <div className="absolute -bottom-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                                    SUR 100
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ANALYSE DÉTAILLÉE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Colonne Gauche : Synthèse */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. L'Analyse Textuelle du Tuteur */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                                <Brain className="text-brand-primary" size={20}/> Analyse du Mentor
                            </h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {report.detailed_analysis}
                            </p>
                        </div>

                        {/* 2. La "Boîte de Verre" (Graphe) pour l'étudiant */}
                        {caseData && caseData.reasoning_graph && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <h3 className="text-lg font-bold text-brand-dark mb-2 flex items-center gap-2">
                                    <Activity className="text-blue-500" size={20}/> La logique du cas
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">Voici le cheminement clinique idéal pour ce patient.</p>

                                {/* On réutilise le composant graphique en lecture seule */}
                                <ReasoningGraph data={caseData.reasoning_graph} />
                            </div>
                        )}
                    </div>

                    {/* Colonne Droite : Checklists */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Points Forts / Faibles */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4">Points clés</h4>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Points Forts</span>
                                    <ul className="mt-2 space-y-2">
                                        {report.feedback_strengths.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-gray-100 my-4"></div>

                                <div>
                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">À Améliorer</span>
                                    <ul className="mt-2 space-y-2">
                                        {report.feedback_improvements.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></div>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Checklist des questions obligatoires */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ListChecks size={18}/> Questions Clés
                            </h4>
                            <div className="space-y-3">
                                {Object.entries(report.key_questions_status || {}).map(([question, asked]: [string, any]) => (
                                    <div key={question} className={`p-3 rounded-lg border flex items-start gap-3 ${asked ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        {asked ? <CheckCircle size={16} className="text-green-600 mt-0.5" /> : <XCircle size={16} className="text-red-500 mt-0.5" />}
                                        <span className={`text-sm ${asked ? 'text-green-800' : 'text-red-800'}`}>{question}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- FOOTER ACTIONS --- */}
                <div className="flex justify-center gap-4 mt-12">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 bg-white border border-gray-300 text-brand-dark font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Retour au Dashboard
                    </button>
                    <button
                        onClick={() => router.push(`/simulation/${id}`)} // Attention: il faudrait une logique pour "Recommencer" proprement
                        className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primaryHover transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                        <RotateCcw size={18} /> Réessayer ce cas
                    </button>
                </div>

            </main>
        </div>
    );
}
```

### 📄 `frontendv3\components\dashboard\SkillsRadar.tsx`

```tsx
"use client";

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

interface SkillsRadarProps {
    skillMatrix: Record<string, { level: number, sessions: number }> | null;
}

// Catégories par défaut à afficher pour un nouvel utilisateur (Score 0)
const DEFAULT_CATEGORIES = [
    "Cardiologie",
    "Pneumologie",
    "Infectiologie",
    "Neurologie",
    "Urgences",
    "Pédiatrie"
];

export function SkillsRadar({ skillMatrix }: SkillsRadarProps) {

    // 1. TRANSFORMATION DES DONNÉES
    let data = [];

    if (!skillMatrix || Object.keys(skillMatrix).length === 0) {
        // CAS 1 : Nouvel utilisateur (Matrice vide) -> On affiche les défauts à 0
        data = DEFAULT_CATEGORIES.map(cat => ({
            subject: cat,
            A: 0,
            fullMark: 100,
        }));
    } else {
        // CAS 2 : Utilisateur avec données
        data = Object.entries(skillMatrix).map(([category, stats]) => ({
            subject: category,
            A: stats.level,
            fullMark: 100,
            sessions: stats.sessions
        }));

        // 2. GESTION DU TROP-PLEIN (Scalabilité)
        // Un radar chart devient illisible avec > 8 axes.
        // Stratégie : On trie par niveau et on garde le Top 6 pour montrer le "Profil Dominant".
        if (data.length > 6) {
            // On trie pour avoir les compétences les plus fortes en premier
            data.sort((a, b) => b.A - a.A);
            // On garde les 6 premières
            data = data.slice(0, 6);
        }
    }

    // Sécurité pour le rendu graphique (il faut au moins 3 points pour faire un polygone)
    // Si après filtrage on a moins de 3 catégories, on ajoute des placeholders
    while (data.length < 3) {
        data.push({ subject: " ", A: 0, fullMark: 100, sessions: 0 });
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col min-h-[350px]">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-brand-dark">Profil de Compétences</h3>
                    <p className="text-xs text-gray-400">
                        {Object.keys(skillMatrix || {}).length > 6
                            ? "Top 6 de vos domaines maîtrisés"
                            : "Niveau moyen par spécialité"}
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />

                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
                        />

                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />

                        <Radar
                            name="Niveau"
                            dataKey="A"
                            stroke="#D97706" // Orange Brand
                            strokeWidth={3}
                            fill="#D97706"
                            fillOpacity={0.2}
                        />

                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: number) => [`${value}/100`, 'Niveau']}
                            labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Message si vide (optionnel, pour guider) */}
                {(!skillMatrix || Object.keys(skillMatrix).length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs text-brand-primary font-medium mt-20">
                            Commencez une simulation pour voir votre progression
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\expert\KnowledgeGraph.tsx`

```tsx
"use client";

import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

export function KnowledgeGraph({ caseData }: { caseData: any }) {

    // Transformation des données du cas en Noeuds et Arêtes pour le graphe
    const { nodes, edges } = useMemo(() => {
        const initialNodes = [];
        const initialEdges = [];
        let yPos = 100;

        // 1. Noeud Central : Le Patient
        initialNodes.push({
            id: 'patient',
            type: 'input', // Noeud source
            data: { label: `Patient (${caseData.age} ans, ${caseData.sexe})` },
            position: { x: 250, y: 0 },
            style: { background: '#111827', color: 'white', fontWeight: 'bold' }
        });

        // 2. Noeuds Symptômes
        caseData.symptoms.forEach((sym: any, index: number) => {
            const id = `sym-${index}`;
            initialNodes.push({
                id: id,
                data: { label: `Symptôme: ${sym.nom}` },
                position: { x: 50 + (index * 150), y: 150 },
                style: { background: '#FFF7ED', border: '1px solid #F97316' }
            });
            // Lien Patient -> Symptôme
            initialEdges.push({ id: `e-p-${id}`, source: 'patient', target: id, animated: true });
        });

        // 3. Noeuds Diagnostics
        caseData.diagnoses.forEach((diag: any, index: number) => {
            const id = `diag-${index}`;
            initialNodes.push({
                id: id,
                data: { label: diag.is_final ? `Diagnostic FINAL: ${diag.description}` : `Différentiel: ${diag.description}` },
                position: { x: 100 + (index * 200), y: 300 },
                style: diag.is_final
                    ? { background: '#10B981', color: 'white' }
                    : { background: '#F3F4F6' }
            });

            // On relie arbitrairement les symptômes aux diagnostics pour la visualisation
            // (Dans un vrai réseau sémantique, on lierait précisément, ici on visualise la structure)
            caseData.symptoms.forEach((_, sIdx: number) => {
                initialEdges.push({
                    id: `e-s${sIdx}-d${index}`,
                    source: `sym-${sIdx}`,
                    target: id,
                    style: { stroke: '#ddd' }
                });
            });
        });

        return { nodes: initialNodes, edges: initialEdges };
    }, [caseData]);

    const [nodesState, , onNodesChange] = useNodesState(nodes);
    const [edgesState, , onEdgesChange] = useEdgesState(edges);

    return (
        <div style={{ height: 500 }} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
```

### 📄 `frontendv3\components\expert\ReasoningGraph.tsx`

```tsx
"use client";

import React, { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Configuration du layout automatique (Dagre)
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[]) => {
    dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 180, height: 50 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            x: nodeWithPosition.x - 90,
            y: nodeWithPosition.y - 25,
        };
        return node;
    });

    return { nodes: layoutedNodes, edges };
};

export function ReasoningGraph({ data }: { data: any }) {
    // Transformation des données brutes en format ReactFlow
    const initialNodes = data?.nodes?.map((n: any) => ({
        id: n.id,
        data: { label: n.label },
        position: { x: 0, y: 0 }, // Sera calculé par Dagre
        style: {
            background: n.type === 'diagnosis' ? '#dcfce7' : n.type === 'symptom' ? '#fff' : '#fef9c3',
            border: n.type === 'diagnosis' ? '2px solid #16a34a' : '1px solid #ddd',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            width: 180
        }
    })) || [];

    const initialEdges = data?.edges?.map((e: any, i: number) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#94a3b8' },
        labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 }
    })) || [];

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
    );

    const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
    const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

    if (!data || !data.nodes || data.nodes.length === 0) {
        return <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">Aucun graphe de raisonnement disponible.</div>;
    }

    return (
        <div className="h-[500px] w-full border border-gray-200 rounded-xl bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#ccc" gap={20} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
```

### 📄 `frontendv3\components\layout\AdminSidebar.tsx`

```tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Database, FileText, Settings, LogOut, Stethoscope
} from 'lucide-react';

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        { href: '/expert', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        // On pourra ajouter d'autres pages plus tard si besoin
        // { href: '/expert/stats', label: 'Statistiques', icon: FileText },
    ];

    return (
        <div className="w-64 bg-brand-dark text-white flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-white/10 h-16">
                <div className="bg-brand-primary p-1.5 rounded-lg">
                    <Stethoscope size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">MedAdmin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                    Gestion
                </p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                isActive
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/10">
                <div className="mb-4 px-4">
                    <p className="text-xs text-gray-500 uppercase font-bold">Connecté en tant que</p>
                    <p className="text-sm font-semibold text-white">Expert</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut size={18} />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\layout\AuthLayout.tsx`

```tsx
import React from 'react';
import { Stethoscope, User, Lock } from 'lucide-react'; // Importer des icônes utiles


interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex font-sans antialiased">

            {/* --- Colonne Gauche (Image + Brand) --- */}
            <div className="hidden lg:flex lg:w-5/12 bg-brand-dark relative overflow-hidden flex-col justify-between p-12 text-white">

                {/* Animation de fond (Blobs) */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

                {/* Logo + Marque */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                        <Stethoscope size={28} className="text-brand-primary" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">MedTutor<span className="text-brand-primary">.AI</span></span>
                </div>

                {/* Texte et Image */}
                <div className="relative z-10 mt-12">
                    <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6">
                        Devenez un expert <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-brand-primary">
              en toute confiance.
            </span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-sm leading-relaxed">
                        Entraînez-vous avec des patients virtuels réalistes et perfectionnez votre diagnostic dans un environnement sûr et personnalisé.
                    </p>
                </div>

                {/* Image principale (Médecin stylisé) */}
                <div className="relative z-10 mt-auto pt-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 to-transparent z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
                            alt="Medical Student"
                            className="w-full h-64 object-cover object-top transform hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 mt-6 text-xs text-gray-500 font-medium">
                    Projet STI 5GI © 2025
                </div>
            </div>

            {/* --- COLONNE DROITE (Formulaire) --- */}
            <div className="w-full lg:w-7/12 bg-brand-light flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Titre et Sous-titre */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
                            {title}
                        </h1>
                        <p className="mt-2 text-gray-500">
                            {subtitle}
                        </p>
                    </div>

                    {/* Inserer les formulaires enfants ici (Login/Register) */}
                    {children}
                </div>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\layout\Navbar.tsx`

```tsx
"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Stethoscope, User } from 'lucide-react';

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="bg-brand-primary/10 p-2 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
                            <Stethoscope size={24} className="text-brand-primary" />
                        </div>
                        <span className="text-xl font-bold text-brand-dark tracking-tight">
              MedTutor<span className="text-brand-primary">.AI</span>
            </span>
                    </Link>

                    {/* User Profile & Actions */}
                    <div className="flex items-center gap-6">
                        {user && (
                            <div className="hidden md:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-brand-dark">{user.username}</p>
                                    <p className="text-xs text-brand-muted font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                                        {user.role}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-brand-light rounded-full flex items-center justify-center border border-gray-200">
                                    <User size={20} className="text-brand-muted" />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
```

### 📄 `frontendv3\components\simulation\ChatBubble.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { User, Stethoscope, Lightbulb } from "lucide-react";

interface ChatBubbleProps {
    sender: 'APPRENANT' | 'PATIENT_IA' | 'TUTEUR';
    content: string;
}

export function ChatBubble({ sender, content }: ChatBubbleProps) {

    // Configuration du style selon l'expéditeur
    const styles = {
        APPRENANT: {
            container: "justify-end",
            bubble: "bg-brand-primary text-white rounded-br-none",
            icon: null, // Pas d'icône pour soi-même, juste la bulle
            label: "Vous"
        },
        PATIENT_IA: {
            container: "justify-start",
            bubble: "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm",
            icon: <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200"><User size={16} /></div>,
            label: "Patient"
        },
        TUTEUR: {
            container: "justify-center my-4", // Centré pour l'intervention
            bubble: "bg-amber-50 border-l-4 border-amber-400 text-amber-900 w-full max-w-2xl shadow-sm",
            icon: <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Lightbulb size={18} /></div>,
            label: "Mentor Socratique"
        }
    };

    const style = styles[sender] || styles.PATIENT_IA;
    const isTutor = sender === 'TUTEUR';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${style.container} mb-4`}
        >
            {/* Icône à gauche pour le Patient ou Tuteur */}
            {sender !== 'APPRENANT' && (
                <div className="flex-shrink-0 mt-1">
                    {style.icon}
                </div>
            )}

            <div className={`flex flex-col ${sender === 'APPRENANT' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <span className="text-xs text-gray-400 mb-1 ml-1">{style.label}</span>

                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${style.bubble}`}>
                    {/* Si c'est le tuteur, on met un titre */}
                    {isTutor && <div className="font-bold text-amber-700 mb-1 flex items-center gap-2"><Lightbulb size={14}/> Intervention Pédagogique</div>}
                    {content}
                </div>
            </div>

        </motion.div>
    );
}
```

### 📄 `frontendv3\components\simulation\ClinicalDecision.tsx`

```tsx
"use client";

import { useState } from 'react';
import { AlertTriangle, FileText, Pill, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ClinicalDecisionProps {
    onDiagnose: (diagnosis: string, prescription: string) => void;
    onCancel: () => void; // Nouveau bouton annuler
}

export function ClinicalDecision({ onDiagnose, onCancel }: ClinicalDecisionProps) {
    const [diagnosis, setDiagnosis] = useState("");
    const [prescription, setPrescription] = useState("");

    const handleSubmit = () => {
        if (!diagnosis.trim()) return;
        onDiagnose(diagnosis, prescription);
    };

    return (
        <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3 items-start">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-0.5">
                    <CheckCircle size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-purple-900 text-sm">Moment de vérité</h4>
                    <p className="text-xs text-purple-700 mt-1">
                        Vous êtes sur le point de conclure ce cas. Une fois validé, vous ne pourrez plus revenir en arrière.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Zone Diagnostic */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                        <FileText size={16} className="text-brand-primary"/> Diagnostic Principal
                    </label>
                    <textarea
                        className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all h-24 resize-none shadow-sm"
                        placeholder="Ex: Paludisme simple à P. Falciparum..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Zone Prescription */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                        <Pill size={16} className="text-blue-500"/> Traitement & Conduite
                    </label>
                    <textarea
                        className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all h-24 resize-none shadow-sm"
                        placeholder="Ex: Coartem 4 comprimés, Paracétamol..."
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                    Annuler
                </button>
                <Button
                    onClick={handleSubmit}
                    disabled={!diagnosis.trim()}
                    className="flex-[2] bg-brand-primary hover:bg-brand-primaryHover text-white shadow-lg shadow-brand-primary/20"
                >
                    Valider le diagnostic
                </Button>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\simulation\ClinicalToolbar.tsx`

```tsx
"use client";

import {
    Activity,       // Constantes
    Eye,            // Inspection
    Stethoscope,    // Auscultation
    Hand,           // Palpation
    Microscope,     // Examens
    Thermometer,    // Température
    Search
} from 'lucide-react';

interface ClinicalToolbarProps {
    onAction: (category: string, actionName: string) => void;
    disabled: boolean;
}

export function ClinicalToolbar({ onAction, disabled }: ClinicalToolbarProps) {

    // Ordre clinique logique : On regarde, on mesure, on touche, on écoute.
    const tools = [
        {
            category: "1. Inspection Générale",
            icon: <Eye size={18} className="text-emerald-600" />,
            actions: [
                "État Général & Conscience",
                "Peau et Muqueuses (Coloration)",
                "Faciès & Regard",
                "Gorge / Bouche",
                "Marche & Posture",
                "Signes de détresse respiratoire"
            ]
        },
        {
            category: "2. Constantes Vitales",
            icon: <Activity size={18} className="text-blue-600" />,
            actions: [
                "Prise de Tension (TA)",
                "Fréquence Cardiaque (Pouls)",
                "Fréquence Respiratoire",
                "Température",
                "Saturation O2 (SpO2)",
                "Glycémie Capillaire (Dextro)"
            ]
        },
        {
            category: "3. Palpation",
            icon: <Hand size={18} className="text-purple-600" />,
            actions: [
                "Palpation Abdominale",
                "Pouls Périphériques",
                "Recherche d'œdèmes (Godet)",
                "Aires Ganglionnaires",
                "Palpation des reliefs osseux"
            ]
        },
        {
            category: "4. Auscultation",
            icon: <Stethoscope size={18} className="text-brand-primary" />,
            actions: [
                "Auscultation Cardiaque",
                "Auscultation Pulmonaire",
                "Bruits intestinaux (Hydro-aériques)",
                "Souffles vasculaires"
            ]
        },
        {
            category: "Examens Spécifiques",
            icon: <Microscope size={18} className="text-gray-600" />,
            actions: [
                "Examen Neurologique (Réflexes)",
                "Examen ORL (Otoscope)",
                "Bandelette Urinaire",
                "ECG (Électrocardiogramme)"
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* En-tête */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-brand-dark text-xs uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} /> Actes Cliniques
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">Sélectionnez un geste</span>
            </div>

            {/* Liste Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
                {tools.map((group, idx) => (
                    <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>

                        {/* Titre de catégorie */}
                        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-gray-50/80 rounded-lg text-gray-800 font-bold text-xs uppercase tracking-wide border border-gray-100">
                            {group.icon}
                            {group.category}
                        </div>

                        {/* Boutons d'action */}
                        <div className="grid grid-cols-1 gap-1">
                            {group.actions.map((action) => (
                                <button
                                    key={action}
                                    onClick={() => onAction(group.category.replace(/^[0-9].\s/, ''), action)}
                                    disabled={disabled}
                                    className="text-left text-xs font-medium px-3 py-2.5 rounded-lg border border-transparent text-gray-600 hover:bg-brand-light hover:text-brand-primary hover:border-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center group"
                                >
                                    {action}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary font-bold">→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {/* Marge de fin pour le scroll */}
                <div className="h-4"></div>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\simulation\MedicalNotepad.tsx`

```tsx
"use client";

import { PenLine } from 'lucide-react';

interface MedicalNotepadProps {
    notes: string;
    setNotes: (notes: string) => void;
}

export function MedicalNotepad({ notes, setNotes }: MedicalNotepadProps) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-yellow-50/50 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-yellow-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <PenLine size={14} /> Notes Cliniques
                </h3>
                <span className="text-[10px] text-yellow-600 font-medium">Brouillon personnel</span>
            </div>

            {/* Zone de texte */}
            <div className="flex-1 p-0 relative">
        <textarea
            className="w-full h-full p-4 resize-none outline-none text-sm text-gray-700 leading-relaxed bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-white"
            placeholder="Notez ici vos observations, hypothèses et éléments clés..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            spellCheck={false}
        />
                {/* Petit guide en bas */}
                <div className="absolute bottom-4 right-4 text-[10px] text-gray-300 pointer-events-none">
                    Vos notes ne sont pas vues par le patient
                </div>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\simulation\MentorHistory.tsx`

```tsx
"use client";

import { Lightbulb, MessageSquareQuote } from 'lucide-react';

interface MentorHistoryProps {
    messages: any[];
}

export function MentorHistory({ messages }: MentorHistoryProps) {
    // Filtrer uniquement les messages du TUTEUR
    const tutorMessages = messages.filter((m) => m.sender === 'TUTEUR');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb size={14} /> Conseils du Mentor
                </h3>
                <span className="text-[10px] text-amber-600 font-medium">{tutorMessages.length} interventions</span>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {tutorMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center space-y-2 opacity-60">
                        <MessageSquareQuote size={32} />
                        <p className="text-xs">Aucune intervention pour le moment.<br/>Continuez comme ça !</p>
                    </div>
                ) : (
                    tutorMessages.map((msg) => (
                        <div key={msg.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3 shadow-sm animate-fade-in">
                            <div className="flex gap-2 items-start">
                                <div className="mt-0.5 bg-amber-200 text-amber-700 rounded-full p-1 flex-shrink-0">
                                    <Lightbulb size={10} />
                                </div>
                                <div>
                                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                        {msg.content.replace('🤔 Question du Mentor :', '').trim()}
                                    </p>
                                    <span className="text-[9px] text-amber-500/80 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\simulation\MentorSidecar.tsx`

```tsx
"use client";

import { Lightbulb, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MentorSidecarProps {
    adviceId: number | null; // <--- NOUVEAU : On écoute l'ID unique
    adviceContent: string | null;
}

export function MentorSidecar({ adviceId, adviceContent }: MentorSidecarProps) {
    const [isVisible, setIsVisible] = useState(false);

    // À chaque fois que l'ID change (nouveau message), on force l'affichage
    useEffect(() => {
        if (adviceId && adviceContent) {
            setIsVisible(true);
        }
    }, [adviceId, adviceContent]); // Dépendance sur l'ID !

    if (!adviceContent) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    id="tour-mentor-sidecar"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="mx-3 mb-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm relative overflow-hidden"
                >
                    {/* Bandeau décoratif */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>

                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 animate-pulse">
                                <Lightbulb size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Question du Mentor
                </span>
                            <button
                                onClick={() => setIsVisible(false)} // Ferme uniquement ce message
                                className="absolute top-2 right-2 p-1 text-amber-400 hover:text-amber-700 hover:bg-amber-100 rounded-full transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Contenu */}
                        <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                            {adviceContent}
                        </p>

                        <div className="mt-2 pt-2 border-t border-amber-100 text-[9px] text-amber-600/70 text-right italic">
                            Réflexion socratique
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
```

### 📄 `frontendv3\components\simulation\PatientMonitor.tsx`

```tsx
"use client";

import { Activity, Thermometer, Heart, Wind, Droplets, User, ArrowLeft } from 'lucide-react';

export interface VitalsData {
    ta?: string;   // Tension Artérielle
    fc?: string;   // Fréquence Cardiaque
    temp?: string; // Température
    spo2?: string; // Saturation O2
    fr?: string;   // Fréquence Respiratoire
    glyc?: string; // Glycémie
}

interface PatientMonitorProps {
    caseTitle: string;
    patientInfo: { age: number; sexe: string };
    vitals: VitalsData;
    onExit: () => void;
}

export function PatientMonitor({ caseTitle, patientInfo, vitals, onExit }: PatientMonitorProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm z-30 shrink-0">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                {/* 1. INFO PATIENT (Gauche) */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={onExit}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        title="Quitter"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${patientInfo.sexe === 'Homme' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-pink-50 border-pink-200 text-pink-600'}`}>
                            <User size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-brand-dark leading-tight line-clamp-1 max-w-[200px]">
                                {caseTitle}
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">
                                {patientInfo.age} ans • {patientInfo.sexe}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. LE MONITEUR (Centre - Style "Machine") */}
                <div className="flex-1 flex justify-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 bg-gray-900 p-1.5 rounded-xl border border-gray-700 shadow-inner min-w-fit">
                        <VitalCard icon={Activity} label="TA" value={vitals.ta} unit="mmHg" color="text-green-400" />
                        <Divider />
                        <VitalCard icon={Heart} label="FC" value={vitals.fc} unit="bpm" color="text-red-400" />
                        <Divider />
                        <VitalCard icon={Thermometer} label="TEMP" value={vitals.temp} unit="°C" color="text-orange-400" />
                        <Divider />
                        <VitalCard icon={Droplets} label="SpO2" value={vitals.spo2} unit="%" color="text-blue-400" />
                        <Divider />
                        <VitalCard icon={Wind} label="FR" value={vitals.fr} unit="/min" color="text-cyan-400" />
                    </div>
                </div>

                {/* 3. ACTIONS (Droite) */}
                <div className="hidden md:flex w-auto justify-end">
                    <button
                        onClick={onExit}
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg border border-transparent hover:border-red-100 transition-all"
                    >
                        Terminer la session
                    </button>
                </div>

            </div>
        </div>
    );
}

// Sous-composant pour une tuile de constante
function VitalCard({ icon: Icon, label, value, unit, color }: any) {
    return (
        <div className="flex flex-col items-center justify-between w-14 sm:w-16 h-12 px-1">
            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                <Icon size={10} /> {label}
            </div>
            {value ? (
                <div className={`text-sm sm:text-base font-mono font-bold leading-none ${color} animate-pulse`}>
                    {value}
                </div>
            ) : (
                <div className="text-sm font-mono text-gray-700 leading-none">--</div>
            )}
            <div className="text-[8px] text-gray-600 font-medium scale-90 origin-bottom">{unit}</div>
        </div>
    );
}

function Divider() {
    return <div className="w-px bg-gray-700 my-1 opacity-50"></div>;
}
```

### 📄 `frontendv3\components\simulation\SimulationWorkspace.tsx`

```tsx
"use client";

import { useState } from 'react';
import { ClinicalToolbar } from './ClinicalToolbar';
import { MedicalNotepad } from './MedicalNotepad';
import { MentorHistory } from './MentorHistory';
import { Activity, FileEdit, Lightbulb } from 'lucide-react';

interface SimulationWorkspaceProps {
    onAction: (category: string, actionName: string) => void;
    disabled: boolean;
    messages: any[];
    notes: string;
    setNotes: (n: string) => void;
    hasNewTutorMessage?: boolean;
}

export function SimulationWorkspace({
                                        onAction, disabled, messages, notes, setNotes, hasNewTutorMessage
                                    }: SimulationWorkspaceProps) {

    const [activeTab, setActiveTab] = useState<'tools' | 'notes' | 'mentor'>('tools');

    const tabs = [
        { id: 'tools', label: 'Actes', icon: Activity },
        { id: 'notes', label: 'Notes', icon: FileEdit },
        { id: 'mentor', label: 'Mentor', icon: Lightbulb, alert: hasNewTutorMessage },
    ];

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl z-20 w-80 lg:w-96 transition-all duration-300">
            <div className="flex border-b border-gray-200 bg-gray-50">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            id={`tour-tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                        flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all relative
                        ${isActive
                                ? 'bg-white text-brand-primary border-t-2 border-brand-primary'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                    `}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                            {tab.alert && !isActive && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse border border-white" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-hidden relative bg-white">
                {activeTab === 'tools' && <ClinicalToolbar onAction={onAction} disabled={disabled} />}
                {activeTab === 'notes' && <MedicalNotepad notes={notes} setNotes={setNotes} />}
                {activeTab === 'mentor' && <MentorHistory messages={messages} />}
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\ui\Button.tsx`

```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export function Button({ children, variant = 'primary', isLoading, className, ...props }: ButtonProps) {

    const baseStyle = "w-full py-3 px-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";


    const variants = {
        primary: "bg-brand-primary hover:bg-brand-primaryHover text-white shadow-lg hover:shadow-xl transform active:scale-95",
        outline: "border-2 border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary bg-transparent",
        ghost: "bg-transparent text-brand-primary hover:bg-brand-primary/10"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className || ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : children}
        </button>
    );
}
```

### 📄 `frontendv3\components\ui\CaseCard.tsx`

```tsx
"use client";

import { Clock, ChevronRight } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '@/lib/categoryIcons';

interface CaseCardProps {
    title: string;
    summary: string;
    category: string;
    difficulty?: 'Facile' | 'Moyen' | 'Difficile';
    onClick: () => void;
}

export function CaseCard({ title, summary, category, difficulty = 'Moyen', onClick }: CaseCardProps) {

    const difficultyDot = {
        Facile: "bg-green-400",
        Moyen: "bg-yellow-400",
        Difficile: "bg-red-500"
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            {/* Header de la carte : Icône + Catégorie */}
            <div className="flex justify-between items-start mb-3">
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                </div>

                {/* Indicateur de difficulté (Point discret) */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${difficultyDot[difficulty]}`}></span>
                    {difficulty}
                </div>
            </div>

            {/* Titre */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-brand-primary transition-colors">
                {title}
            </h3>

            {/* Résumé (tronqué) */}
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                {summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Clock size={14} className="text-gray-300"/>
                    <span>15 min</span>
                </div>

                <span className="text-xs font-bold text-brand-primary flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Lancer <ChevronRight size={14} />
        </span>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\ui\Input.tsx`

```tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string; // Le label est optionnel (utile si on veut juste le champ)
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="w-full">
            {/* Label avec une typographie soignée */}
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    {label}
                </label>
            )}

            {/*
         Le champ input :
         - rounded-xl : Coins bien arrondis (moderne)
         - py-3.5 : Plus de hauteur pour un effet "aéré"
         - focus:ring-4 : Un halo doux lors du clic
         - transition-all : Animation fluide lors du focus
      */}
            <input
                className={`
          w-full px-4 py-3.5 rounded-xl border bg-gray-50 text-gray-900 placeholder:text-gray-400
          focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10
          transition-all duration-300 ease-in-out outline-none
          ${error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 hover:border-gray-300'
                }
          ${className || ''}
        `}
                {...props}
            />

            {/* Message d'erreur avec animation */}
            {error && (
                <p className="mt-1.5 ml-1 text-sm text-red-500 font-medium animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
}
```

### 📄 `frontendv3\components\ui\Modal.tsx`

```tsx
"use client";

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    // Empêcher le scroll du body quand la modale est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fond sombre flouté */}
            <div
                className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Contenu de la modale */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                {/* En-tête */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Corps */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\components\ui\SessionCard.tsx`

```tsx
"use client";

import { Play, Trash2, Calendar, MessageSquare } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '@/lib/categoryIcons';

interface SessionCardProps {
    session: any;
    onResume: () => void;
    onDelete: () => void;
}

export function SessionCard({ session, onResume, onDelete }: SessionCardProps) {
    // Formatage de la date
    const date = new Date(session.start_time).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    // Récupération de la catégorie du cas (si disponible)
    const categoryName = session.case.categories && session.case.categories.length > 0
        ? session.case.categories[0].name
        : "Général";

    return (
        <div className="bg-white rounded-xl p-5 border border-brand-primary/20 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">

            {/* Bandeau latéral pour indiquer "En cours" */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary"></div>

            <div className="flex justify-between items-start mb-3 pl-2">
                <div className={`flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-semibold ${getCategoryColor(categoryName)}`}>
                    {getCategoryIcon(categoryName)}
                    <span>{categoryName}</span>
                </div>
                <span className="text-xs text-brand-primary font-bold bg-brand-primary/10 px-2 py-1 rounded-full">
            En cours
        </span>
            </div>

            <div className="pl-2">
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-1">
                    {session.case.case_title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {date}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12}/> {session.messages.length} messages</span>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onResume}
                        className="flex-1 bg-brand-dark text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Play size={14} fill="currentColor" /> Reprendre
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Supprimer la session"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
```

### 📄 `frontendv3\context\AuthContext.tsx`

```tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

interface User {
    user_id: number;
    username: string;
    role: 'APPRENANT' | 'EXPERT'; // Assurez-vous que les types matchent votre backend
}

interface AuthContextType {
    user: User | null;
    login: (access: string, refresh: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Vérification basique d'expiration
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({
                        user_id: decoded.user_id,
                        username: decoded.username,
                        role: decoded.role // Le rôle vient du token
                    });
                }
            } catch (e) {
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = (access: string, refresh: string) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        const decoded: any = jwtDecode(access);

        // Mise à jour de l'état
        setUser({
            user_id: decoded.user_id,
            username: decoded.username,
            role: decoded.role
        });

        // --- CORRECTION ICI : REDIRECTION CONDITIONNELLE ---
        if (decoded.role === 'EXPERT') {
            router.push('/expert');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
```

### 📄 `frontendv3\hooks\useSimulationTour.ts`

```ts
import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useSimulationTour(startTour: boolean, setStartTour: (v: boolean) => void) {

    useEffect(() => {
        if (!startTour) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Commencer !',
            nextBtnText: 'Suivant',
            prevBtnText: 'Précédent',
            onDestroyed: () => setStartTour(false), // Reset l'état à la fermeture
            steps: [
                {
                    element: '#tour-header-patient',
                    popover: {
                        title: '👨‍⚕️ Le Dossier Patient',
                        description: 'Ici, vous voyez les infos administratives. Le moniteur se remplira automatiquement (TA, Pouls...) dès que vous effectuerez des mesures.'
                    }
                },
                {
                    element: '#tour-chat-area',
                    popover: {
                        title: '💬 L\'Anamnèse (Dialogue)',
                        description: 'Discutez avec le patient ici. Posez des questions pour comprendre ses symptômes et son histoire.'
                    }
                },
                {
                    element: '#tour-tab-tools',
                    popover: {
                        title: '🩺 Actes Cliniques',
                        description: 'Ne restez pas théorique ! Cliquez ici pour effectuer des examens physiques (Tension, Auscultation, etc.).'
                    }
                },
                {
                    element: '#tour-tab-notes',
                    popover: {
                        title: '📝 Bloc-Notes',
                        description: 'Notez vos observations et hypothèses ici. C\'est un brouillon personnel pour structurer votre pensée.'
                    }
                },
                {
                    element: '#tour-mentor-sidecar',
                    popover: {
                        title: '💡 Votre Mentor',
                        description: 'Si vous êtes bloqué ou si vous faites une erreur de raisonnement, le Mentor Socratique apparaîtra ici pour vous guider.'
                    }
                }
            ]
        });

        driverObj.drive();

    }, [startTour, setStartTour]);
}
```

### 📄 `frontendv3\lib\api.ts`

```ts
import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Si on reçoit une 401, on déconnecte l'utilisateur proprement
            // (Pour une V2, on implémentera le refresh token ici)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
```

### 📄 `frontendv3\lib\categoryIcons.tsx`

```tsx
import { Heart, Activity, Brain, Stethoscope, Baby, Bone, Eye, Pill, Thermometer } from 'lucide-react';

// On accepte string, mais aussi undefined ou null pour éviter le crash
export const getCategoryIcon = (categoryName?: string | null) => {
    // SÉCURITÉ : Si pas de nom, on renvoie l'icône par défaut tout de suite
    if (!categoryName) return <Stethoscope className="text-brand-primary" />;

    const normalized = categoryName.toLowerCase();

    if (normalized.includes('cardio')) return <Heart className="text-red-500" />;
    if (normalized.includes('neuro')) return <Brain className="text-pink-500" />;
    if (normalized.includes('pédia')) return <Baby className="text-blue-400" />;
    if (normalized.includes('urgence')) return <Activity className="text-orange-500" />;
    if (normalized.includes('ortho') || normalized.includes('musculo')) return <Bone className="text-stone-500" />;
    if (normalized.includes('ophtalmo')) return <Eye className="text-cyan-500" />;
    if (normalized.includes('pharmaco') || normalized.includes('traitement')) return <Pill className="text-green-500" />;
    if (normalized.includes('infectio') || normalized.includes('viral') || normalized.includes('grippe')) return <Thermometer className="text-red-400" />;

    return <Stethoscope className="text-brand-primary" />;
};

export const getCategoryColor = (categoryName?: string | null) => {
    // SÉCURITÉ : Si pas de nom, on renvoie la couleur par défaut
    if (!categoryName) return "bg-brand-light text-brand-dark border-gray-100";

    const normalized = categoryName.toLowerCase();

    if (normalized.includes('cardio')) return "bg-red-50 text-red-700 border-red-100";
    if (normalized.includes('neuro')) return "bg-pink-50 text-pink-700 border-pink-100";
    if (normalized.includes('urgence')) return "bg-orange-50 text-orange-700 border-orange-100";
    if (normalized.includes('pédia')) return "bg-blue-50 text-blue-700 border-blue-100";
    if (normalized.includes('infectio')) return "bg-red-50 text-red-600 border-red-100";

    return "bg-brand-light text-brand-dark border-gray-100";
};
```

### 📄 `frontendv3\next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

### 📄 `frontendv3\next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

### 📄 `frontendv3\tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: "#111827",    // Bleu nuit (un peu plus clair)
                    primary: "#D97706", // Orange vibrant (plus chaleureux)
                    primaryHover: "#b45309",
                    light: "#F9FAFB",   // Gris très très clair (presque blanc)
                    secondary: "#60A5FA", // Optionnel, un bleu plus doux
                    success: "#34D399",  // Optionnel, pour les succès (vert)
                    error: "#F87171",    // Optionnel, pour les erreurs (rouge)
                    text: "#374151",     // Gris foncé pour le texte principal
                    muted: "#6B7280",    // Gris moyen pour le texte secondaire
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Police d'Inter, en premier
            },
            boxShadow: {
                DEFAULT: '0 2px 10px rgba(0, 0, 0, 0.07)',  // Ombre subtile
            },
            keyframes: { // Gardez ça : Ce sont les animations
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'blob': 'blob 7s infinite',
            },
        },
    },
    plugins: [],
};
export default config;
```

---

## 🐍 Backend (Django)

### 📄 `backend\api\__init__.py`

```py

```

### 📄 `backend\api\admin.py`

```py
from django.contrib import admin

# Register your models here.

```

### 📄 `backend\api\apps.py`

```py
from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

```

### 📄 `backend\api\models.py`

```py
from django.db import models

# Create your models here.

```

### 📄 `backend\api\tests.py`

```py
from django.test import TestCase

# Create your tests here.

```

### 📄 `backend\api\views.py`

```py
from django.shortcuts import render

# Create your views here.

```

### 📄 `backend\cases\__init__.py`

```py

```

### 📄 `backend\cases\admin.py`

```py
from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import (
    ClinicalCase, Symptom, MedicalHistory, CurrentTreatment,
    ComplementaryExam, PhysicalFinding, Diagnosis
)


class SymptomInline(admin.TabularInline):
    model = Symptom
    extra = 1

class MedicalHistoryInline(admin.TabularInline):
    model = MedicalHistory
    extra = 1

class CurrentTreatmentInline(admin.TabularInline):
    model = CurrentTreatment
    extra = 1

class ComplementaryExamInline(admin.TabularInline):
    model = ComplementaryExam
    extra = 1

class DiagnosisInline(admin.TabularInline):
    model = Diagnosis
    extra = 1

class PhysicalFindingInline(admin.TabularInline):
    model = PhysicalFinding
    extra = 1


@admin.register(ClinicalCase)
class ClinicalCaseAdmin(admin.ModelAdmin):
    # Ce qu'on voit dans la liste des cas
    list_display = ('id', 'case_title', 'status','display_categories', 'validated_by', 'updated_at', )
    # Permet de filtrer par statut et catégorie
    list_filter = ('status', 'categories')
    filter_horizontal = ('categories',)
    # Permet de faire une recherche
    search_fields = ('case_title', 'case_summary')
    # Permet d'éditer les symptômes et antécédents directement depuis la page du cas
    inlines = [SymptomInline, MedicalHistoryInline]

    def display_categories(self, obj):
        return ", ".join([category.name for category in obj.categories.all()])

    display_categories.short_description = 'Catégories'


admin.site.register(Symptom)
admin.site.register(MedicalHistory)
admin.site.register(CurrentTreatment)
admin.site.register(ComplementaryExam)
admin.site.register(PhysicalFinding)
admin.site.register(Diagnosis)
```

### 📄 `backend\cases\apps.py`

```py
from django.apps import AppConfig


class CasesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "cases"

```

### 📄 `backend\cases\fixtures\mock_fultang_api.json`

```json
[
  {
    "id": "case_infectio_001",
    "timestamp": "2024-10-28T08:30:00Z",
    "raw_notes": "Homme de 24 ans. Motif: Fièvre et frissons. Histoire: Début brutal il y a 48h. Fièvre chiffrée à 40°C, sueurs profuses, céphalées frontales intenses et courbatures généralisées. Nausées sans vomissements. Pas de toux, pas de signes urinaires. Contexte: Retour d'un séjour au village (zone forestière) il y a 10 jours. N'a pas pris de chimioprophylaxie. Examen: TA 110/70, FC 110, T° 39.8°C. Pâleur conjonctivale légère. Splénomégalie palpable type 1. Goutte épaisse demandée."
  },
  {
    "id": "case_cardio_002",
    "timestamp": "2024-10-28T09:15:00Z",
    "raw_notes": "Femme de 65 ans, diabétique type 2 et hypertendue (traitement mal suivi). Consulte aux urgences pour une oppression thoracique rétrosternale survenue au repos ce matin, durant depuis 45 minutes. Irradiations dans la mâchoire et le bras gauche. Sensation de 'mort imminente'. Dyspnée légère. Examen: TA 160/95, FC 90. Auscultation cardio-pulmonaire sans particularité. Pas d'oedème des membres inférieurs. ECG en cours."
  },
  {
    "id": "case_pneumo_ped_003",
    "timestamp": "2024-10-28T10:00:00Z",
    "raw_notes": "Garçon de 18 mois, amené par sa mère. Toux sèche et difficulté respiratoire évoluant depuis 3 jours, suite à un rhume. Refus de s'alimenter depuis ce matin. Pas de fièvre. ATCD: Eczéma atopique. Examen: Enfant agité, polypnée à 50/min, tirage sous-costal visible. À l'auscultation: sibilants expiratoires diffus et quelques crépitants aux bases. Saturation O2 air ambiant: 92%."
  },
  {
    "id": "case_gastro_004",
    "timestamp": "2024-10-28T11:20:00Z",
    "raw_notes": "Homme de 30 ans. Douleur abdominale évoluant depuis 24h. Initialement épigastrique, la douleur a migré en fosse iliaque droite (FID). Nausées, un vomissement alimentaire. Anorexie. Température 38.2°C. Examen: Douleur provoquée à la palpation du point de McBurney. Défense en FID. Reste de l'abdomen souple. Toucher rectal douloureux à droite."
  },
  {
    "id": "case_neuro_005",
    "timestamp": "2024-10-28T13:45:00Z",
    "raw_notes": "Femme de 45 ans. Consulte pour des céphalées hémicrâniennes droites pulsatiles évoluant par crises depuis l'adolescence. La crise actuelle dure depuis 6 heures, résistante au Paracétamol. Photophobie et phonophobie marquées. Nausées importantes. Pas de déficit moteur, pas de fièvre, raideur de nuque absente. Notion de stress professionnel récent."
  },
  {
    "id": "case_traumato_006",
    "timestamp": "2024-10-28T15:10:00Z",
    "raw_notes": "Jeune homme de 20 ans, footballeur amateur. Torsion du genou droit lors d'un match ce matin (mécanisme de pivot-contact). Craquement audible suivi d'une douleur immédiate et d'une impotence fonctionnelle totale. Gonflement rapide du genou (hémarthrose probable). Examen difficile vu la douleur. Test de Lachman semble mou. Pas de laxité latérale évidente."
  },
  {
    "id": "case_metabo_007",
    "timestamp": "2024-10-28T16:30:00Z",
    "raw_notes": "Adolescente de 14 ans, sans antécédents. Amenée pour asthénie majeure, amaigrissement de 5kg en 3 semaines malgré un appétit conservé (polyphagie). La mère signale que l'enfant boit énormément (polydipsie) et urine souvent, y compris la nuit (polyurie). Haleine odeur pomme reinette (cétonique). À l'examen: déshydratation cutanée, conscience normale mais fatiguée. Dextro (glycémie capillaire) : 'High' (> 5g/L)."
  },
  {
    "id": "case_dermato_008",
    "timestamp": "2024-10-28T17:45:00Z",
    "raw_notes": "Homme de 35 ans. Consulte pour une éruption cutanée apparue il y a 3 jours. Lésions vésiculeuses sur fond érythémateux, suivant un trajet linéaire intercostal gauche (hémithorax). Douleur type brûlure intense précédant l'éruption de 48h. Pas de fièvre. Notion de varicelle dans l'enfance. Le patient est sous corticoides pour un asthme depuis 1 mois."
  }
]
```

### 📄 `backend\cases\management\__init__.py`

```py

```

### 📄 `backend\cases\management\commands\__init__.py`

```py

```

### 📄 `backend\cases\management\commands\export_dataset.py`

```py


import csv
import json
import io
from datetime import datetime
from django.core.management.base import BaseCommand
from cases.models import ClinicalCase
from core.minio_client import upload_to_minio
from django.conf import settings


class Command(BaseCommand):
    help = "Exporte les cas cliniques de la base de données vers un fichier CSV ou JSON."

    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            type=str,
            choices=['csv', 'json', 'jsonl'],
            default='jsonl',
            help='Format du fichier de sortie (csv ou json). Par défaut : csv.'
        )
        parser.add_argument(
            '--output-path',
            type=str,
            default='./data_exports',
            help='Chemin du répertoire où sauvegarder le fichier.'
        )
        parser.add_argument(
            '--status',
            type=str,
            default='approuve',
            help='Statut des cas à exporter. Par défaut : "approuve".'
        )

    def handle(self, *args, **options):
        file_format = options['format']
        status = options['status']

        self.stdout.write(f"Début de l'exportation des cas '{status}' vers MinIO au format {file_format}...")

        cases_to_export = ClinicalCase.objects.filter(status=status).prefetch_related(
            'categories', 'symptoms', 'history_entries', 'current_treatments',
            'exams', 'physical_findings', 'diagnoses'
        )

        if not cases_to_export.exists():
            self.stdout.write(self.style.WARNING(f"Aucun cas clinique avec le statut '{status}' n'a été trouvé."))
            return

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"dataset_{status}_{timestamp}.{file_format}"

        data_stream = None
        data_length = 0
        content_type = ''

        if file_format == 'csv':
            string_buffer = io.StringIO()
            self._export_to_csv(cases_to_export, string_buffer)

            csv_bytes = string_buffer.getvalue().encode('utf-8')
            data_stream = io.BytesIO(csv_bytes)
            data_length = len(csv_bytes)
            content_type = 'text/csv'
        else:  # json ou jsonl
            byte_buffer = io.BytesIO()
            self._export_to_json(cases_to_export, byte_buffer, pretty=(file_format == 'json'))

            data_stream = byte_buffer
            data_length = byte_buffer.getbuffer().nbytes
            content_type = 'application/json' if file_format == 'json' else 'application/x-jsonlines'

        data_stream.seek(0)

        try:
            upload_to_minio(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=file_name,
                data_stream=data_stream,
                length=data_length,
                content_type=content_type
            )
            self.stdout.write(self.style.SUCCESS(f"Exportation réussie ! Fichier '{file_name}' uploadé sur MinIO."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Erreur lors de l'upload sur MinIO : {e}"))



    def _export_to_csv(self, queryset, file_object):
        """Exporte un dataset complet et aplati au format CSV."""
        headers = [
            'case_id', 'case_title', 'status', 'age', 'sexe', 'motif_consultation',
            'categories', 'symptoms_json', 'history_json', 'current_treatments_json',
            'exams_json', 'physical_findings_json', 'diagnoses_json'
        ]
        writer = csv.writer(file_object)
        writer.writerow(headers)

        for case in queryset:
            categories_str = " | ".join([cat.name for cat in case.categories.all()])
            symptoms_list = [{'nom': s.nom, 'localisation': s.localisation, 'degre': s.degre} for s in
                             case.symptoms.all()]
            history_list = [{'type': h.get_type_display(), 'description': h.description} for h in
                            case.history_entries.all()]
            treatments_list = [{'nom': t.nom, 'posologie': t.posologie} for t in case.current_treatments.all()]
            exams_list = [{'nom': e.nom, 'resultat': e.resultat} for e in case.exams.all()]
            findings_list = [{'nom_examen': p.nom_examen, 'resultat_observation': p.resultat_observation} for p in
                             case.physical_findings.all()]
            diagnoses_list = [{'description': d.description, 'is_final': d.is_final} for d in case.diagnoses.all()]

            row_data = [
                case.id,
                case.case_title,
                case.status,
                case.age,
                case.sexe,
                case.motif_consultation,
                categories_str,
                json.dumps(symptoms_list, ensure_ascii=False),
                json.dumps(history_list, ensure_ascii=False),
                json.dumps(treatments_list, ensure_ascii=False),
                json.dumps(exams_list, ensure_ascii=False),
                json.dumps(findings_list, ensure_ascii=False),
                json.dumps(diagnoses_list, ensure_ascii=False)
            ]
            writer.writerow(row_data)

    def _export_to_json(self, queryset, file_object, pretty):
        """Exporte un dataset complet et hiérarchique en JSON ou JSONL."""
        all_cases_data = []
        for case in queryset:
            case_data = {
                'case_id': case.id,
                'case_title': case.case_title,
                'status': case.status,
                'age': case.age,
                'sexe': case.sexe,
                'motif_consultation': case.motif_consultation,
                'categories': [cat.name for cat in case.categories.all()],
                'symptoms': [
                    {'nom': s.nom, 'localisation': s.localisation, 'date_debut': s.date_debut, 'frequence': s.frequence,
                     'duree': s.duree, 'evolution': s.evolution, 'activite_declenchante': s.activite_declenchante,
                     'degre': s.degre}
                    for s in case.symptoms.all()
                ],
                'history_entries': [
                    {'type': h.get_type_display(), 'description': h.description}
                    for h in case.history_entries.all()
                ],
                'current_treatments': [
                    {'nom': t.nom, 'posologie': t.posologie, 'date_debut': t.date_debut, 'efficacite': t.efficacite}
                    for t in case.current_treatments.all()
                ],
                'exams': [
                    {'nom': e.nom, 'resultat': e.resultat}
                    for e in case.exams.all()
                ],
                'physical_findings': [
                    {'nom_examen': p.nom_examen, 'resultat_observation': p.resultat_observation}
                    for p in case.physical_findings.all()
                ],
                'diagnoses': [
                    {'description': d.description, 'is_final': d.is_final}
                    for d in case.diagnoses.all()
                ]
            }
            all_cases_data.append(case_data)

        if pretty:
            json_str = json.dumps(all_cases_data, ensure_ascii=False, indent=4)
            file_object.write(json_str.encode('utf-8'))
        else:
            for item in all_cases_data:
                json_line = json.dumps(item, ensure_ascii=False)
                file_object.write((json_line + '\n').encode('utf-8'))
```

### 📄 `backend\cases\management\commands\import_cases.py`

```py
import json
import os
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from cases.models import Category, ClinicalCase
from cases.services.case_importer import get_structured_data_from_llm, save_structured_data_to_db


class Command(BaseCommand):
    help = 'Importe de nouveaux cas cliniques, les structure via un LLM et les sauvegarde.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mock',
            action='store_true',
            help='Utilise le fichier de données mock au lieu de l\'API Fultang réelle.'
        )

    def handle(self, *args, **options):
        self.stdout.write("--- DÉMARRAGE DU SYSTÈME D'IMPORTATION ---")

        # 1. Chargement du contexte (Catégories)
        existing_categories_names = list(Category.objects.values_list('name', flat=True))
        self.stdout.write(f"Contexte : {len(existing_categories_names)} catégories existantes en base.")

        fultang_cases_raw = []
        use_fallback = False  # Indicateur pour savoir si on doit utiliser les données de démo

        # --- BRANCHE 1 : MODE MOCK FORCÉ ---
        if options['mock']:
            self.stdout.write(self.style.WARNING("🔶 Mode MOCK forcé par l'utilisateur."))
            use_fallback = True

        # --- BRANCHE 2 : MODE LIVE (TENTATIVE DE CONNEXION) ---
        else:
            self.stdout.write("\n1. TENTATIVE DE CONNEXION À FULTANG (LIVE)...")
            try:
                url = settings.FULTANG_API_URL
                headers = {'Authorization': f'Token {settings.FULTANG_API_KEY}'}

                self.stdout.write(f"   Connexion à : {url} ...")
                response = requests.get(url, headers=headers, timeout=15)

                if response.status_code == 200:
                    self.stdout.write(self.style.SUCCESS("   ✅ CONNEXION RÉUSSIE (HTTP 200)"))
                    api_data = response.json()

                    # Fultang renvoie un objet avec une clé 'patients'
                    real_patients = api_data.get('patients', [])

                    count = len(real_patients)
                    if count == 0:
                        # --- LE MESSAGE EXPLICITE QUE TU VEUX ---
                        self.stdout.write(self.style.WARNING(
                            f"   ⚠️  AVERTISSEMENT : La base de données Fultang est accessible mais VIDE (0 patients trouvés)."))
                        self.stdout.write("   -> Bascule automatique vers le mode DÉMONSTRATION pour la présentation.")
                        use_fallback = True
                    else:
                        self.stdout.write(self.style.SUCCESS(f"   🚀 {count} patients récupérés depuis Fultang."))
                        fultang_cases_raw = real_patients
                else:
                    self.stdout.write(self.style.ERROR(f"   ❌ Erreur API Fultang : Code {response.status_code}"))
                    self.stdout.write("   -> Bascule vers le mode DÉMONSTRATION par sécurité.")
                    use_fallback = True

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   ❌ Échec de la connexion réseau : {e}"))
                self.stdout.write("   -> Bascule vers le mode DÉMONSTRATION.")
                use_fallback = True

        # --- CHARGEMENT DES DONNÉES DE DÉMO (SI NÉCESSAIRE) ---
        if use_fallback:
            self.stdout.write("\n2. CHARGEMENT DES DONNÉES DE DÉMONSTRATION (Mock)...")
            try:
                fixture_path = os.path.join(settings.BASE_DIR, 'cases', 'fixtures', 'mock_fultang_api.json')
                with open(fixture_path, 'r', encoding='utf-8') as f:
                    fultang_cases_raw = json.load(f)
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ {len(fultang_cases_raw)} cas de démonstration chargés avec succès."))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"   ❌ Erreur critique chargement démo : {e}"))
                return

        # --- TRAITEMENT INTELLIGENT (BOUCLE COMMUNE) ---
        if not fultang_cases_raw:
            self.stdout.write(self.style.WARNING("Aucune donnée à traiter."))
            return

        self.stdout.write(f"\n3. TRAITEMENT INTELLIGENT VIA GEN-AI ({len(fultang_cases_raw)} cas)...")

        successful_imports = 0
        failed_imports = 0

        for case_data_raw in fultang_cases_raw:
            fultang_id = case_data_raw.get('id')
            if not fultang_id:
                continue

            if ClinicalCase.objects.filter(source_fultang_id=fultang_id).exists():
                self.stdout.write(f"   - Le cas {fultang_id} existe déjà. Ignoré.")
                continue

            self.stdout.write(f"   - Traitement et structuration du cas {fultang_id}...")

            # Petite pause pour respecter les quotas API (Groq est rapide, 2s suffit)
            import time
            time.sleep(2)

            try:
                structured_data = get_structured_data_from_llm(case_data_raw, existing_categories_names)
                if not structured_data:
                    self.stderr.write(self.style.ERROR(f"     [ÉCHEC] Structuration échouée pour {fultang_id}."))
                    failed_imports += 1
                    continue

                case_instance, created_categories = save_structured_data_to_db(structured_data, fultang_id)

                msg = f"     [SUCCÈS] Cas importé (ID: {case_instance.id})."
                if created_categories:
                    msg += f" Catégories créées: {created_categories}"
                self.stdout.write(self.style.SUCCESS(msg))
                successful_imports += 1

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"     [ERREUR] {e}"))
                failed_imports += 1

        self.stdout.write("\n" + "=" * 40)
        self.stdout.write(
            self.style.SUCCESS(f"IMPORTATION TERMINÉE. Succès: {successful_imports} | Échecs: {failed_imports}"))
```

### 📄 `backend\cases\models.py`

```py
from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class ClinicalCase(models.Model):
    class Status(models.TextChoices):
        NON_APPROUVE = 'non_approuve', 'Non Approuvé'
        APPROUVE = 'approuve', 'Approuvé'
        REJETE = 'rejete', 'Rejeté'

    source_fultang_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NON_APPROUVE)
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    case_title = models.CharField(max_length=255)
    case_summary = models.TextField(blank=True, null=True)
    learning_objectives = models.TextField(blank=True, null=True)
    motif_consultation = models.TextField()
    age = models.PositiveIntegerField()
    sexe = models.CharField(max_length=50)

    etat_civil = models.CharField(max_length=100, blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    nombre_enfant = models.PositiveIntegerField(blank=True, null=True)
    groupe_sanguin = models.CharField(max_length=10, blank=True, null=True)

    mode_de_vie = models.JSONField(null=True, blank=True)
    categories = models.ManyToManyField(Category, blank=True, related_name='cases')
    raw_llm_suggestions = models.JSONField(default=dict, blank=True)

    key_questions = models.JSONField(
        default=list,
        blank=True,
        null=True,
        help_text="Liste des questions clés que l'apprenant doit poser."
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Motif du rejet (rempli par l'expert)"
    )

    difficulty = models.CharField(
        max_length=20,
        choices=[('Facile', 'Facile'), ('Moyen', 'Moyen'), ('Difficile', 'Difficile')],
        default='Moyen',
        blank=True,
        null=True
    )

    reasoning_graph = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        help_text="Structure nœuds/liens représentant le raisonnement clinique (généré par IA)."
    )

    def __str__(self):
        return f"Cas #{self.id} ({self.case_title}) - {self.get_status_display()}"


class Symptom(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='symptoms', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    localisation = models.CharField(max_length=200, blank=True, null=True)
    date_debut = models.CharField(max_length=100, blank=True, null=True)
    frequence = models.CharField(max_length=100, blank=True, null=True)
    duree = models.CharField(max_length=100, blank=True, null=True)
    evolution = models.TextField(blank=True, null=True)
    activite_declenchante = models.CharField(max_length=255, blank=True, null=True)
    degre = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} (Cas #{self.case.id})"


class MedicalHistory(models.Model):
    class HistoryType(models.TextChoices):
        MALADIE = 'maladie', 'Maladie'
        CHIRURGIE = 'chirurgie', 'Chirurgie'
        FAMILIAL = 'familial', 'Familiaux'
        ALLERGIE = 'allergie', 'Allergies'
        OBSTETRICAL = 'obstetrical', 'Obstétricaux'

    case = models.ForeignKey(ClinicalCase, related_name='history_entries', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=HistoryType.choices)
    description = models.TextField(help_text="Description générale")  # On garde pour la compatibilité

    # --- CHAMPS SPÉCIFIQUES (Selon votre graphe) ---
    # Pour Maladie / Chirurgie
    nom = models.CharField(max_length=200, blank=True, null=True)
    date = models.CharField(max_length=100, blank=True, null=True, help_text="Date ou Date début")
    date_fin = models.CharField(max_length=100, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)

    # Pour le Traitement lié à la maladie
    traitement_nom = models.CharField(max_length=200, blank=True, null=True)
    traitement_duree = models.CharField(max_length=100, blank=True, null=True)
    traitement_posologie = models.CharField(max_length=200, blank=True, null=True)

    # Pour Allergie
    declencheur = models.CharField(max_length=200, blank=True, null=True)
    manifestation = models.CharField(max_length=200, blank=True, null=True)

    # Pour Obstétrique
    nombre_grossesse = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.type}: {self.nom or self.description}"


class CurrentTreatment(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='current_treatments', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    posologie = models.CharField(max_length=200, blank=True, null=True)
    date_debut = models.CharField(max_length=100, blank=True, null=True)
    efficacite = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} (Cas #{self.case.id})"


class ComplementaryExam(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='exams', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    resultat = models.TextField()
    anatomie = models.CharField(max_length=200, blank=True, null=True, help_text="Zone anatomique concernée")

    def __str__(self):
        return f"Examen : {self.nom} (Cas #{self.case.id})"


class PhysicalFinding(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='physical_findings', on_delete=models.CASCADE)
    nom_examen = models.CharField(max_length=200)
    resultat_observation = models.TextField()

    def __str__(self):
        return f"Examen physique : {self.nom_examen} (Cas #{self.case.id})"


class Diagnosis(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='diagnoses', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    is_final = models.BooleanField(default=False)

    def __str__(self):
        final_text = "[Final] " if self.is_final else ""
        return f"{final_text}{self.description} (Cas #{self.case.id})"



```

### 📄 `backend\cases\schema\__init__.py`

```py

```

### 📄 `backend\cases\schema\case_schemas.py`

```py


from pydantic import BaseModel, Field
from typing import List, Optional


class SymptomStructure(BaseModel):
    nom: str = Field(description="Nom du symptôme, tel que rapporté par le patient (ex: 'douleur thoracique').")
    localisation: Optional[str] = Field(description="Où le symptôme se manifeste (ex: 'rétrosternale').", default=None)
    date_debut: Optional[str] = Field(description="Quand le symptôme a commencé (ex: 'il y a 2 heures').", default=None)
    frequence: Optional[str] = Field(description="Fréquence du symptôme (ex: 'constante', 'intermittente').", default=None)
    duree: Optional[str] = Field(description="Durée de chaque épisode (ex: 'environ 15 minutes').", default=None)
    evolution: Optional[str] = Field(description="Comment le symptôme a évolué depuis son apparition.", default=None)
    activite_declenchante: Optional[str] = Field(description="Ce qui semble déclencher ou aggraver le symptôme (ex: 'à l'effort').", default=None)
    degre: Optional[int] = Field(description="Sévérité du symptôme sur une échelle de 1 à 10.", default=None)


class ExamStructure(BaseModel):
    nom: str = Field(description="Nom de l'examen")
    resultat: str = Field(description="Résultat complet")
    anatomie: Optional[str] = Field(description="Zone anatomique concernée (ex: Thorax, Abdomen)", default=None)


class HistoryEntryStructure(BaseModel):
    type: str = Field(description="Type précis: maladie, chirurgie, familial, allergie, obstetrical")
    # Champs communs
    nom: Optional[str] = Field(description="Nom de la pathologie ou de l'acte", default=None)
    description: str = Field(description="Résumé textuel complet (fallback)")

    # Spécifique Maladie/Chirurgie
    date: Optional[str] = Field(description="Date ou date de début", default=None)
    date_fin: Optional[str] = Field(description="Date de fin (si applicable)", default=None)
    observation: Optional[str] = Field(description="Observations supplémentaires", default=None)

    # Traitement lié (Sous-branche Maladie)
    traitement_nom: Optional[str] = Field(description="Nom du traitement lié à cette maladie", default=None)
    traitement_duree: Optional[str] = Field(description="Durée du traitement", default=None)
    traitement_posologie: Optional[str] = Field(description="Posologie du traitement", default=None)

    # Spécifique Allergie
    declencheur: Optional[str] = Field(description="Molécule ou facteur déclenchant", default=None)
    manifestation: Optional[str] = Field(description="Symptômes de l'allergie", default=None)

    # Spécifique Obstétrique
    nombre_grossesse: Optional[int] = Field(description="Nombre de grossesses (G)", default=None)
class TreatmentStructure(BaseModel):
    nom: str = Field(description="Nom du médicament ou du traitement en cours.")
    posologie: Optional[str] = Field(description="Dosage et fréquence du traitement (ex: '10mg, 1 fois par jour').", default=None)
    efficacite: Optional[str] = Field(description="Perception de l'efficacité du traitement par le patient.", default=None)


class PhysicalFindingStructure(BaseModel):
    nom_examen: str = Field(description="Partie de l'examen physique réalisée (ex: 'Auscultation cardiaque').")
    resultat_observation: str = Field(description="Observation ou résultat de cet examen (ex: 'Bruits du cœur réguliers, pas de souffle').")

class DiagnosisStructure(BaseModel):
    description: str = Field(description="Description du diagnostic (ex: 'Infarctus du myocarde antérieur').")
    is_final: bool = Field(description="Indique si c'est le diagnostic final confirmé pour ce cas.")

class GraphNodeStructure(BaseModel):
    id: str = Field(description="Identifiant unique court du nœud (ex: 'S1', 'D2')")
    label: str = Field(description="Le texte affiché (ex: 'Douleur thoracique', 'Infarctus')")
    type: str = Field(description="Le type de nœud : 'symptom', 'history', 'exam', 'diagnosis' ou 'hypothesis'")

class GraphEdgeStructure(BaseModel):
    source: str = Field(description="L'ID du nœud source")
    target: str = Field(description="L'ID du nœud cible")
    label: str = Field(description="La relation logique (ex: 'suggère', 'confirme', 'exclut', 'nécessite')")

class ReasoningGraphStructure(BaseModel):
    nodes: List[GraphNodeStructure] = Field(description="Liste des nœuds du graphe")
    edges: List[GraphEdgeStructure] = Field(description="Liste des liens logiques entre les nœuds")


class PedagogicalDataStructure(BaseModel):
    case_title: str = Field(description="Titre pédagogique NE RÉVÉLANT PAS le diagnostic. Ex: 'Douleur abdominale...' pas 'Appendicite'")
    categories: List[str] = Field(description="Liste des catégories médicales pertinentes pour ce cas.")
    difficulty: str = Field(description="Difficulté estimée du cas, choisir parmi: Facile, Moyen, Difficile.")
    learning_objectives: str = Field(description="Objectifs pédagogiques que l'apprenant doit atteindre.")
    key_questions_to_ask: List[str] = Field(description="Liste des 3 à 5 questions essentielles que l'apprenant doit poser.")
    common_pitfalls: str = Field(description="Description des erreurs de diagnostic ou de raisonnement courantes à éviter.")

class SimulationDataStructure(BaseModel):
    patient_persona: str = Field(description="Description de la personnalité du patient à simuler (ex: 'Anxieux et utilise des termes vagues').")
    initial_statement: str = Field(description="La phrase exacte que le patient doit dire pour commencer la consultation.")

class PatientInfoStructure(BaseModel):
    age: int = Field(description="Âge du patient en années.")
    sexe: str = Field(description="Sexe biologique du patient (Homme/Femme).")
    etat_civil: Optional[str] = Field(description="État civil du patient.", default=None)
    profession: Optional[str] = Field(description="Profession du patient.", default=None)

class ConsultationInfoStructure(BaseModel):
    motif_consultation: str = Field(description="Raison principale de la consultation, telle que formulée par le patient.")

class ClinicalDataStructure(BaseModel):
    patient_info: PatientInfoStructure
    consultation_info: ConsultationInfoStructure
    symptoms: List[SymptomStructure]
    history_entries: List[HistoryEntryStructure]
    current_treatments: List[TreatmentStructure]
    exams: List[ExamStructure]
    physical_findings: List[PhysicalFindingStructure]
    diagnoses: List[DiagnosisStructure]



class FullCaseStructure(BaseModel):
    pedagogical_data: PedagogicalDataStructure
    simulation_data: SimulationDataStructure
    clinical_data: ClinicalDataStructure
    reasoning_graph: ReasoningGraphStructure = Field(
        description="Graphe représentant le raisonnement clinique logique du cas.")
```

### 📄 `backend\cases\serializers.py`

```py
# backend/cases/serializers.py

from rest_framework import serializers
from .models import ClinicalCase, Category, Diagnosis, PhysicalFinding, \
    ComplementaryExam, CurrentTreatment, MedicalHistory, Symptom  # Importez les autres modèles au besoin

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class ClinicalCaseListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour afficher une liste de cas.
    """
    categories = CategorySerializer(many=True, read_only=True)
    class Meta:
        model = ClinicalCase
        fields = ['id', 'case_title', 'case_summary', 'categories', 'status', 'age', 'sexe']


class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = '__all__'


class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = '__all__'


class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentTreatment
        fields = '__all__'


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplementaryExam
        fields = '__all__'


class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalFinding
        fields = '__all__'


class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class ClinicalCaseDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour afficher toutes les informations d'un seul cas.
    Nous le complexifierons plus tard pour inclure les symptômes, etc.
    """
    symptoms = SymptomSerializer(many=True, read_only=True)
    history_entries = MedicalHistorySerializer(many=True, read_only=True)
    current_treatments = TreatmentSerializer(many=True, read_only=True)
    exams = ExamSerializer(many=True, read_only=True)
    physical_findings = FindingSerializer(many=True, read_only=True)
    diagnoses = DiagnosisSerializer(many=True, read_only=True)

    class Meta:
        model = ClinicalCase
        fields = '__all__' # Inclut tous les champs du modèle









```

### 📄 `backend\cases\services\__init__.py`

```py

```

### 📄 `backend\cases\services\case_importer.py`

```py
# backend/cases/services/case_importer.py

import json
from django.db import transaction
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from django.conf import settings

from cases.models import (
    Category, ClinicalCase, Symptom, MedicalHistory, CurrentTreatment,
    ComplementaryExam, PhysicalFinding, Diagnosis
)
from cases.schema.case_schemas import FullCaseStructure


@transaction.atomic
def save_structured_data_to_db(structured_data: dict, fultang_id: str):
    """
    Prend un dictionnaire de données structurées (validé par Pydantic),
    et sauvegarde toutes les informations dans la base de données Django
    en utilisant une transaction atomique.
    """
    pedagogical_data = structured_data.get('pedagogical_data', {})
    simulation_data = structured_data.get('simulation_data', {})
    clinical_data = structured_data.get('clinical_data', {})
    patient_info = clinical_data.get('patient_info', {})
    consultation_info = clinical_data.get('consultation_info', {})

    llm_categories_names = pedagogical_data.get('categories', [])
    final_categories_to_assign = []
    created_categories_names = []

    for cat_name in llm_categories_names:
        clean_cat_name = cat_name.strip()
        if not clean_cat_name:
            continue

        category_obj, created = Category.objects.get_or_create(
            name__iexact=clean_cat_name,
            defaults={'name': clean_cat_name}
        )
        if created:
            created_categories_names.append(clean_cat_name)

        final_categories_to_assign.append(category_obj)

    case_instance = ClinicalCase.objects.create(
        source_fultang_id=fultang_id,

        # Données Pédagogiques
        case_title=pedagogical_data.get('case_title', 'Titre manquant'),
        learning_objectives=pedagogical_data.get('learning_objectives', ''),
        key_questions=pedagogical_data.get('key_questions_to_ask', []),

        # Données Patient
        age=patient_info.get('age', 0),  # 0 comme valeur par défaut pour un entier
        sexe=patient_info.get('sexe', 'Inconnu'),
        etat_civil=patient_info.get('etat_civil', ''),
        profession=patient_info.get('profession', ''),

        # J'ajoute les autres champs de votre modèle avec des valeurs par défaut
        nombre_enfant=patient_info.get('nombre_enfant', 0),
        groupe_sanguin=patient_info.get('groupe_sanguin', ''),
        mode_de_vie=clinical_data.get('mode_de_vie', {}),

        # Données Consultation
        motif_consultation=consultation_info.get('motif_consultation', 'Non spécifié'),

        # Données de Suggestion (toujours présentes)
        raw_llm_suggestions={'suggested_categories': llm_categories_names},

        reasoning_graph = structured_data.get('reasoning_graph', {}),
    )

    if final_categories_to_assign:
        case_instance.categories.set(final_categories_to_assign)

    for symptom_data in clinical_data.get('symptoms', []):
        Symptom.objects.create(case=case_instance, **symptom_data)

    for history_data in clinical_data.get('history_entries', []):
        MedicalHistory.objects.create(case=case_instance, **history_data)

    for treatment_data in clinical_data.get('current_treatments', []):
        CurrentTreatment.objects.create(case=case_instance, **treatment_data)

    for exam_data in clinical_data.get('exams', []):
        ComplementaryExam.objects.create(case=case_instance, **exam_data)

    for finding_data in clinical_data.get('physical_findings', []):
        PhysicalFinding.objects.create(case=case_instance, **finding_data)

    for diagnosis_data in clinical_data.get('diagnoses', []):
        Diagnosis.objects.create(case=case_instance, **diagnosis_data)

    return case_instance, created_categories_names


def get_structured_data_from_llm(raw_data, existing_categories_names):
    """
    Utilise LangChain pour transformer les données brutes en un JSON structuré et validé.
    """
    categories_list_str = ", ".join(existing_categories_names)
    context_str = f"[{categories_list_str}]" if existing_categories_names else "(LISTE VIDE - CRÉEZ DES CATÉGORIES PERTINENTES)"

    prompt_template = """
    Tâche : Analyser les données cliniques brutes suivantes et les transformer en un JSON riche et structuré pour une simulation pédagogique.

    Contexte Important (Liste des catégories officielles) : 
    {context_str}

    Instructions :
    1. Lis l'intégralité des données brutes.
    2. Remplis TOUS les champs du format JSON de sortie en te basant sur les données fournies.
    3. Pour "categories", choisis dans la liste fournie. Tu peux en suggérer une nouvelle si absolument nécessaire.
    4. CRITIQUE : Le champ "case_title" est visible par l'étudiant AVANT la simulation. Il NE DOIT PAS révéler le diagnostic final.

    5. GRAPHE DE RAISONNEMENT (reasoning_graph) :
       - Construis un graphe logique qui explique la démarche médicale.
       - NOEUDS : Extrais les symptômes clés, les antécédents majeurs, les examens décisifs et les diagnostics (hypothèses et final).
       - LIENS : Relie-les logiquement (ex: "Douleur" --suggère--> "Infarctus").
       - Ce graphe servira de "Boîte de Verre" pour montrer à l'expert comment l'IA a compris le cas.

    {format_instructions}

    Données brutes :
    {raw_data_str}

    JSON de sortie :
    """

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        api_key=settings.GROQ_API_KEY
    )

    # Le parser va lire FullCaseStructure (qui contient maintenant reasoning_graph)
    # et générer automatiquement le format JSON attendu dans {format_instructions}
    parser = JsonOutputParser(pydantic_object=FullCaseStructure)

    prompt = ChatPromptTemplate.from_template(
        template=prompt_template,
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    response_json = chain.invoke({
        "context_str": context_str,
        "raw_data_str": json.dumps(raw_data, ensure_ascii=False)
    })

    return response_json
```

### 📄 `backend\cases\tests.py`

```py
from django.test import TestCase

# Create your tests here.

```

### 📄 `backend\cases\views.py`

```py
import io

from django.core.management import call_command
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend

# backend/cases/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ClinicalCase, Category
from .serializers import ClinicalCaseListSerializer, ClinicalCaseDetailSerializer, CategorySerializer


class ClinicalCaseViewSet(viewsets.ModelViewSet):  # Changé de ReadOnlyModelViewSet à ModelViewSet (Lecture + Écriture)
    """
    ViewSet principal pour les cas cliniques.
    - Apprenant : Lecture seule, cas approuvés uniquement.
    - Expert : Lecture/Écriture, tous les cas + Actions d'administration.
    """
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'difficulty', 'categories']

    def get_serializer_class(self):
        if self.action == 'list':
            return ClinicalCaseListSerializer
        return ClinicalCaseDetailSerializer

    def get_queryset(self):
        user = self.request.user
        # Si c'est un expert, il voit TOUT
        if hasattr(user, 'profile') and user.profile.role == 'EXPERT':
            return ClinicalCase.objects.all().order_by('-created_at')
        # Si c'est un apprenant, il ne voit que les approuvés
        return ClinicalCase.objects.filter(status='approuve').order_by('-created_at')

    # --- ACTION : IMPORT MANUEL ---
    @action(detail=False, methods=['post'], url_path='trigger-import')
    def trigger_import(self, request):
        if request.user.profile.role != 'EXPERT':
            return Response({"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        # On utilise StringIO pour capturer ce que la commande "print" normalement
        out = io.StringIO()
        err = io.StringIO()

        try:
            # On appelle la commande 'import_cases'
            # On peut passer '--mock' si on est en dév via un paramètre de requête ?mock=true
            use_mock = request.query_params.get('mock') == 'true'
            options = {'mock': use_mock, 'stdout': out, 'stderr': err}

            call_command('import_cases', **options)

            output_msg = out.getvalue()

            if "nouveaux cas trouvés" in output_msg and "0 nouveaux cas" not in output_msg:
                return Response({"message": "Import terminé avec succès.", "details": output_msg},
                                status=status.HTTP_200_OK)
            else:
                # Feedback spécifique si rien de nouveau
                return Response(
                    {"message": "Aucun nouveau cas disponible sur Fultang pour le moment.", "details": output_msg},
                    status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e), "details": err.getvalue()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # --- ACTION : EXPORT DATASET ---
    @action(detail=False, methods=['post'], url_path='trigger-export')
    def trigger_export(self, request):
        if request.user.profile.role != 'EXPERT':
            return Response({"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        out = io.StringIO()
        try:
            # On lance l'export (par défaut jsonl et approuvé)
            call_command('export_dataset', stdout=out)
            return Response({"message": "Dataset généré et envoyé sur MinIO.", "details": out.getvalue()},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet de lister les catégories pour les filtres du frontend.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # Pas besoin de permissions strictes pour lire les catégories, mais IsAuthenticated est bien
```

### 📄 `backend\checkmodels.py`

```py

```

### 📄 `backend\core\__init__.py`

```py

```

### 📄 `backend\core\asgi.py`

```py
"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

application = get_asgi_application()

```

### 📄 `backend\core\minio_client.py`

```py


from minio import Minio
from django.conf import settings
import io


minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_USE_SECURE
)


def upload_to_minio(bucket_name, object_name, data_stream, length, content_type='application/octet-stream'):
    """
    Fonction générique pour uploader un flux de données vers MinIO.
    Elle crée le bucket s'il n'existe pas.
    """
    # Vérifier si le bucket existe, sinon le créer.
    found = minio_client.bucket_exists(bucket_name)
    if not found:
        minio_client.make_bucket(bucket_name)
        print(f"Bucket '{bucket_name}' créé avec succès.")

    # Uploader les données avec le content_type correct
    minio_client.put_object(
        bucket_name,
        object_name,
        data_stream,
        length,
        content_type=content_type
    )
    print(f"'{object_name}' a été uploadé avec succès dans le bucket '{bucket_name}'.")
```

### 📄 `backend\core\wsgi.py`

```py
"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

application = get_wsgi_application()

```

### 📄 `backend\evaluation\__init__.py`

```py

```

### 📄 `backend\evaluation\admin.py`

```py

from django.contrib import admin
from .models import EvaluationLog


@admin.register(EvaluationLog)
class EvaluationLogAdmin(admin.ModelAdmin):

    list_display = ('id', 'get_message_content', 'relevance_score', 'empathy_score', 'created_at')

    list_filter = ('relevance_score', 'created_at')

    readonly_fields = ('message', 'relevance_score', 'empathy_score', 'reasoning', 'pedagogical_feedback')

    def get_message_content(self, obj):
        return obj.message.content[:50] + "..." if obj.message else "N/A"

    get_message_content.short_description = "Message de l'Apprenant"
```

### 📄 `backend\evaluation\agent\__init__.py`

```py

```

### 📄 `backend\evaluation\agent\evaluator.py`

```py
from django.conf import settings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_groq import ChatGroq

from cases.models import ClinicalCase
from evaluation.schemas.evaluator_schemas import EvaluationResult


class TutorEvaluatorAgent:
    """
    Agent pédagogique qui observe la simulation et évalue l'apprenant en temps réel.
    """

    def __init__(self, case: ClinicalCase):
        self.case = case

        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.1,  # Évaluation stricte
            api_key=settings.GROQ_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=EvaluationResult)



    def _get_full_clinical_context(self):
        """Récupère toutes les données du cas pour donner la vérité terrain au Tuteur."""
        c = self.case


        context = f"""
        --- VÉRITÉ TERRAIN DU PATIENT (DOSSIER COMPLET) ---
        TITRE : {c.case_title}
        RÉSUMÉ : {c.case_summary}

        SYMPTÔMES RÉELS :
        {", ".join([f"- {s.nom} ({s.localisation or ''}, {s.degre or ''}/10)" for s in c.symptoms.all()])}

        ANTÉCÉDENTS :
        {", ".join([f"- {h.type}: {h.description}" for h in c.history_entries.all()])}

        TRAITEMENTS EN COURS :
        {", ".join([f"- {t.nom}" for t in c.current_treatments.all()])}

        DIAGNOSTICS (Le final est le but) :
        {", ".join([f"- {d.description} {'(CIBLE FINALE)' if d.is_final else '(Différentiel)'}" for d in c.diagnoses.all()])}

        QUESTIONS CLÉS ATTENDUES (Le chemin idéal) :
        {self.case.key_questions}
        ---------------------------------------------------
        """
        return context


    def evaluate_exchange(self, user_message: str, chat_history_str: str) -> dict:
        """
        Analyse la dernière question de l'apprenant par rapport au contexte du cas.
        """

        full_context_str = self._get_full_clinical_context()
        # Le Prompt Pédagogique (Socratique + Étayage)
        prompt_template = """
                Tu es un Mentor Clinique expert.
                Tu dois évaluer la pertinence de la question de l'étudiant en fonction du DOSSIER COMPLET du patient.

                {full_context}

                HISTORIQUE DE LA CONVERSATION :
                {chat_history}

                DERNIÈRE QUESTION DE L'ÉTUDIANT :
                "{user_message}"

                --- TA MISSION D'ANALYSE ---
                1. Comprends l'INTENTION de l'étudiant. Cherche-t-il un symptôme ? Teste-t-il une hypothèse (même fausse mais logique) ?
                2. Compare cela aux données du dossier.
                   - Si la question explore une piste pertinente (même un diagnostic différentiel), c'est BON.
                   - Si la question est totalement illogique par rapport aux symptômes (ex: demander mal au pied pour une migraine), c'est MAUVAIS.
                   - Si la question est une répétition inutile, c'est MAUVAIS.

                --- RÈGLES D'INTERVENTION ---
                - N'interviens (note < 4 + feedback) QUE si l'étudiant est perdu ou dangereux.
                - S'il explore une piste secondaire logique, laisse-le faire (Note > 6).
                - S'il essaie juste d'etre poli avec le Patient, tu le laisse engagement faire.
                {format_instructions}
                """

        prompt = ChatPromptTemplate.from_template(
            template=prompt_template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        key_questions_val = self.case.key_questions if self.case.key_questions else []
        key_questions_str = ", ".join(key_questions_val) if isinstance(key_questions_val, list) else str(
            key_questions_val)

        # 2. Préparation des Diagnostics (C'est ce qui manquait !)
        # On récupère tous les diagnostics liés au cas via la relation inverse
        diagnoses_objs = self.case.diagnoses.all()
        if diagnoses_objs:
            # On crée une chaîne : "Grippe (Final: Non), Covid (Final: Oui)"
            diagnoses_str = ", ".join(
                [f"{d.description} (Final: {'Oui' if d.is_final else 'Non'})" for d in diagnoses_objs])
        else:
            diagnoses_str = "Diagnostic non défini dans la base."

        # Exécution de la chaîne
        chain = prompt | self.llm | self.parser

        try:
            result = chain.invoke({
                "full_context": full_context_str,
                "case_title": self.case.case_title,
                "case_summary": self.case.case_summary or "",  # Gestion du None
                "diagnoses": diagnoses_str,  # <--- ON PASSE LA VARIABLE MANQUANTE ICI
                "key_questions": key_questions_str,
                "chat_history": chat_history_str,
                "user_message": user_message
            })
            return result
        except Exception as e:
            print(f"Erreur lors de l'évaluation : {e}")
            return None
```

### 📄 `backend\evaluation\agent\summarizer.py`

```py
from django.conf import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from simulation.models import SimulationSession, ChatMessage
from evaluation.models import FinalReport, EvaluationLog
from evaluation.schemas.report_schemas import FinalReportStructure


class SessionSummarizerAgent:
    def __init__(self, session: SimulationSession):
        self.session = session
        self.case = session.case

        # On utilise le modèle le plus intelligent pour l'analyse finale
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.1,  # Très analytique
            api_key=settings.GROQ_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=FinalReportStructure)

    def _get_context_data(self):
        """Prépare toutes les données textuelles pour le prompt."""

        # 1. La conversation
        messages = ChatMessage.objects.filter(session=self.session).order_by('timestamp')
        transcript = ""
        for msg in messages:
            sender = "ÉTUDIANT" if msg.sender == 'APPRENANT' else "PATIENT/SYSTÈME"
            if msg.sender == 'TUTEUR': continue  # On ignore les interventions du tuteur pour l'analyse finale de l'étudiant
            transcript += f"{sender}: {msg.content}\n"

        # 2. Les notes prises par l'Agent Évaluateur en temps réel (précieux !)
        eval_logs = EvaluationLog.objects.filter(message__session=self.session)
        eval_summary = ""
        for log in eval_logs:
            eval_summary += f"- Sur la question '{log.message.content}': Score Pertinence {log.relevance_score}/10. Note: {log.reasoning}\n"

        # 3. Les attentes du cas
        key_questions = self.case.key_questions if self.case.key_questions else []
        key_questions_str = ", ".join(key_questions) if isinstance(key_questions, list) else str(key_questions)

        # Récupération des diagnostics
        diagnoses_objs = self.case.diagnoses.all()
        final_diagnosis = next((d.description for d in diagnoses_objs if d.is_final), "Non défini")

        return {
            "transcript": transcript,
            "eval_notes": eval_summary,
            "case_title": self.case.case_title,
            "final_diagnosis": final_diagnosis,
            "key_questions": key_questions_str
        }

    def generate_report(self) -> FinalReport:
        context = self._get_context_data()

        prompt_template = """
        Tu es un Professeur de Médecine Senior chargé d'évaluer l'examen clinique d'un étudiant.
        Tu dois rédiger le rapport final de la simulation.

        --- CONTEXTE DU CAS (VÉRITÉ) ---
        Cas : {case_title}
        Diagnostic Final Attendu : {final_diagnosis}
        Questions Clés Attendues : {key_questions}

        --- TRANSCRIPTION DE LA CONSULTATION ---
        {transcript}

        --- NOTES D'ÉVALUATION CONTINUES (PRISES PENDANT LA SÉANCE) ---
        {eval_notes}

        --- TA MISSION ---
        Analyse la performance globale de l'étudiant.
        1. A-t-il trouvé le bon diagnostic ? (Regarde la fin de la conversation).
        2. A-t-il posé les questions clés ? (Remplis la checklist).
        3. A-t-il été professionnel ?

        Génère un rapport JSON strict selon le format demandé.
        Soyez juste mais exigeant. Le score global doit refléter la qualité du raisonnement.

        {format_instructions}
        """

        prompt = ChatPromptTemplate.from_template(
            template=prompt_template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        chain = prompt | self.llm | self.parser

        try:
            # Appel au LLM
            data = chain.invoke(context)

            # Création de l'objet en base de données
            report = FinalReport.objects.create(
                session=self.session,
                score_global=data.get('score_global', 0),
                diagnostic_found=data.get('diagnostic_found', False),
                feedback_strengths=data.get('strengths', []),
                feedback_improvements=data.get('improvements', []),
                detailed_analysis=data.get('detailed_analysis', "Pas d'analyse disponible."),
                key_questions_status=data.get('key_questions_checklist', {})
            )
            return report

        except Exception as e:
            print(f"Erreur Summarizer : {e}")
            raise e
```

### 📄 `backend\evaluation\apps.py`

```py
from django.apps import AppConfig


class EvaluationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "evaluation"

```

### 📄 `backend\evaluation\models.py`

```py
# backend/evaluation/models.py

from django.db import models
from simulation.models import ChatMessage, SimulationSession


class EvaluationLog(models.Model):
    """
    Stocke l'analyse pédagogique d'un échange spécifique.
    Lié en OneToOne au message de l'apprenant.
    """
    message = models.OneToOneField(
        ChatMessage,
        on_delete=models.CASCADE,
        related_name='evaluation'
    )

    # Scores quantitatifs
    relevance_score = models.IntegerField(help_text="Pertinence diagnostique (0-10)")
    empathy_score = models.IntegerField(help_text="Qualité de la communication (0-10)", null=True, blank=True)

    # Analyse qualitative
    reasoning = models.TextField(help_text="Explication du score par l'IA")
    pedagogical_feedback = models.TextField(help_text="Conseil ou question socratique pour l'étudiant", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Eval du message {self.message.id} - Score: {self.relevance_score}/10"


class FinalReport(models.Model):
    """
    Le rapport de fin de session généré par l'IA.
    """
    session = models.OneToOneField(
        SimulationSession,
        on_delete=models.CASCADE,
        related_name='report'
    )

    # Indicateurs clés
    score_global = models.IntegerField(help_text="Score global sur 100")
    diagnostic_found = models.BooleanField(default=False, help_text="L'étudiant a-t-il trouvé le bon diagnostic ?")

    # Analyse qualitative (JSON pour flexibilité d'affichage)
    feedback_strengths = models.JSONField(default=list, help_text="Liste des points forts")
    feedback_improvements = models.JSONField(default=list, help_text="Liste des points à améliorer")

    # Analyse détaillée
    detailed_analysis = models.TextField(help_text="Paragraphe de synthèse du professeur")

    # Suivi des questions clés (Quelles questions obligatoires ont été posées ?)
    key_questions_status = models.JSONField(default=dict, help_text="{ 'Question A': true, 'Question B': false }")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rapport Session {self.session.id} - Score: {self.score_global}"
```

### 📄 `backend\evaluation\schemas\__init__.py`

```py

```

### 📄 `backend\evaluation\schemas\evaluator_schemas.py`

```py


from pydantic import BaseModel, Field

class EvaluationResult(BaseModel):
    relevance_score: int = Field(description="Note de 0 à 10 sur la pertinence diagnostique de la question.")
    empathy_score: int = Field(description="Note de 0 à 10 sur le ton et l'empathie (mettre 5 si neutre).")
    reasoning: str = Field(description="Analyse brève expliquant pourquoi cette note a été donnée.")
    pedagogical_feedback: str = Field(description="Une question socratique ou un indice court pour aider l'étudiant, si nécessaire.")
```

### 📄 `backend\evaluation\schemas\report_schemas.py`

```py
from pydantic import BaseModel, Field
from typing import List, Dict


class FinalReportStructure(BaseModel):
    score_global: int = Field(
        description="Note globale sur 100 évaluant la performance médicale et communicationnelle.")
    diagnostic_found: bool = Field(description="Vrai si l'étudiant a explicitement formulé le bon diagnostic à la fin.")

    strengths: List[str] = Field(
        description="Liste de 3 points forts observés (ex: 'Bonne empathie', 'Anamnèse structurée').")
    improvements: List[str] = Field(description="Liste de 3 axes d'amélioration précis.")

    detailed_analysis: str = Field(
        description="Un paragraphe de synthèse bienveillant mais rigoureux, s'adressant directement à l'étudiant ('Vous avez...').")

    key_questions_checklist: Dict[str, bool] = Field(
        description="Un dictionnaire listant chaque 'Question Clé' attendue du cas, avec 'true' si l'étudiant l'a posée (ou un équivalent), et 'false' sinon."
    )
```

### 📄 `backend\evaluation\serializers.py`

```py
from rest_framework import serializers
from .models import FinalReport

class FinalReportSerializer(serializers.ModelSerializer):
    case_id = serializers.IntegerField(source='session.case.id', read_only=True)
    class Meta:
        model = FinalReport
        fields = '__all__'
```

### 📄 `backend\evaluation\tests.py`

```py
from django.test import TestCase

# Create your tests here.

```

### 📄 `backend\evaluation\views.py`

```py
from django.shortcuts import render

# Create your views here.

```

### 📄 `backend\simulation\__init__.py`

```py

```

### 📄 `backend\simulation\admin.py`

```py
from django.contrib import admin

# Register your models here.

```

### 📄 `backend\simulation\agent\__init__.py`

```py

```

### 📄 `backend\simulation\agent\simulator.py`

```py
# backend/simulation/agents/simulator.py
from django.conf import settings

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq

from cases.models import ClinicalCase
from simulation.models import ChatMessage


class PatientSimulatorAgent:
    """
    Agent chargé de générer les réponses du patient simulé en utilisant LangChain.
    Il est initialisé pour un cas clinique et une session de simulation spécifiques.
    """

    def __init__(self, case: ClinicalCase, session_id: int):
        """
        Initialise l'agent avec le cas clinique à simuler et l'ID de la session.
        """
        self.case = case
        self.session_id = session_id

        # 1. Initialisation du Modèle LLM (Gemini via LangChain)
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,  # Plus créatif pour la conversation
            api_key=settings.GROQ_API_KEY
        )

        # 2. Définition du Prompt Template
        # C'est le "scénario" que nous donnons à l'IA. C'est la partie la plus importante.
        # Nouveau Prompt optimisé pour les Actions Cliniques
        prompt_template_str = """
                Tu es une IA simulant un cas médical pour la formation d'un étudiant en médecine.
                Tu dois gérer deux rôles distincts selon l'entrée de l'utilisateur.

                CONTEXTE DU CAS (Vérité Terrain) :
                ---
                Titre : {case_title}
                Résumé : {case_summary}
                Symptômes réels : {symptoms_list}
                Antécédents : {history_list}
                Personnalité du patient : {patient_persona}
                ---

                HISTORIQUE :
                {chat_history}

                DERNIÈRE ENTRÉE DE L'UTILISATEUR :
                "{user_message}"

                --- INSTRUCTIONS DE RÉPONSE ---

                CAS 1 : L'utilisateur pose une question (Dialogue standard).
                - RÔLE : Tu es le PATIENT.
                - TON : Naturel, non médical, subjectif. Tu exprimes ce que tu ressens.
                - EXEMPLE : "J'ai mal au ventre." (Pas "Douleur épigastrique").
                - Si la question n'a pas de sens pour un patient, exprime ton incompréhension.

                CAS 2 : L'utilisateur effectue une ACTION CLINIQUE (L'entrée commence par "[ACTION]").
                - RÔLE : Tu es le SYSTÈME/LE CORPS.
                - TON : Clinique, objectif, précis, "Telegraphic style".
                - TÂCHE : Décris le résultat de l'examen demandé en te basant sur les données du cas.
                - DÉDUCTION : Si une donnée n'est pas explicite dans le résumé ci-dessus (ex: Température), DÉDUIS-LA logiquement du contexte clinique (ex: Si infection -> Fièvre probable / Si cas bénin -> Constantes normales).
                - FORMAT : Ne fais pas de phrases complètes. Donne juste le résultat.
                - EXEMPLE Entrée : "[ACTION] Constantes Vitales > Prise de Tension"
                - EXEMPLE Sortie : "TA : 135/85 mmHg. Asymétrie non notée."
                - EXEMPLE Entrée : "[ACTION] Auscultation > Pulmonaire"
                - EXEMPLE Sortie : "Murmure vésiculaire perçu. Pas de râles crépitants."

                TA RÉPONSE :
                """
        self.prompt = ChatPromptTemplate.from_template(prompt_template_str)

        # 3. Création de la chaîne LangChain (LCEL)
        # C'est l'assemblage : le prompt est envoyé au LLM.
        self.chain = self.prompt | self.llm

    def _get_chat_history_messages(self):
        """
        Récupère l'historique de la conversation depuis la base de données
        et le formate pour LangChain (HumanMessage, AIMessage).
        C'est notre "mémoire" basée sur la BDD.
        """
        messages = ChatMessage.objects.filter(session_id=self.session_id).order_by('timestamp')
        history = []
        for msg in messages:
            if msg.sender == ChatMessage.Sender.APPRENANT:
                history.append(HumanMessage(content=msg.content))
            else:  # C'est une réponse de l'IA (le patient)
                history.append(AIMessage(content=msg.content))
        return history

    def generate_response(self, user_message: str) -> str:
        """
        La méthode principale qui génère la réponse du patient.
        """
        # Formater les données du cas pour les injecter dans le prompt
        symptoms_str = ", ".join([s.nom for s in self.case.symptoms.all()])
        history_str = ", ".join([h.description for h in self.case.history_entries.all()])

        # Récupérer l'historique de la conversation depuis la BDD
        chat_history = self._get_chat_history_messages()

        # Invoquer la chaîne LangChain avec toutes les variables nécessaires
        response = self.chain.invoke({
            "case_title": self.case.case_title,
            "case_summary": self.case.case_summary or "",
            "symptoms_list": symptoms_str or "Aucun",
            "history_list": history_str or "Aucun",
            "patient_persona": "Normal",  # TODO: Utiliser self.case.patient_persona une fois ajouté
            "initial_statement": "Bonjour docteur, je ne me sens pas très bien.",
            # TODO: Utiliser self.case.initial_statement
            "chat_history": chat_history,
            "user_message": user_message
        })

        return response.content.strip()
```

### 📄 `backend\simulation\apps.py`

```py
from django.apps import AppConfig


class SimulationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "simulation"

```

### 📄 `backend\simulation\models.py`

```py
from django.db import models
from django.conf import settings
from cases.models import ClinicalCase


class SimulationSession(models.Model):
    """
    Représente une session de simulation complète, liant un apprenant à un cas clinique.
    C'est le conteneur principal pour une interaction.
    """

    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'En Cours'
        COMPLETED = 'completed', 'Terminée'
        CANCELED = 'canceled', 'Annulée'

    case = models.ForeignKey(
        ClinicalCase,
        on_delete=models.PROTECT,
        related_name='simulation_sessions',
        help_text="Le cas clinique utilisé pour cette simulation."
    )
    apprenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='simulation_sessions',
        help_text="L'utilisateur qui participe à la simulation."
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS
    )

    start_time = models.DateTimeField(
        auto_now_add=True,
        help_text="Date et heure de début de la session."
    )
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date et heure de fin de la session."
    )

    class Meta:
        ordering = ['-start_time']
        verbose_name = "Session de Simulation"
        verbose_name_plural = "Sessions de Simulation"

    def __str__(self):
        return f"Session #{self.id} de {self.apprenant.username} sur le cas '{self.case.case_title}'"


class ChatMessage(models.Model):
    """
    Représente un message unique échangé au cours d'une session de simulation.
    """

    class Sender(models.TextChoices):
        APPRENANT = 'APPRENANT', 'Apprenant'
        PATIENT_IA = 'PATIENT_IA', 'Patient IA'
        SYSTEM = 'SYSTEM', 'Système'
        TUTEUR = 'TUTEUR', 'Tuteur Pédagogique'

    session = models.ForeignKey(
        SimulationSession,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text="La session à laquelle ce message appartient."
    )
    sender = models.CharField(
        max_length=20,
        choices=Sender.choices,
        help_text="Qui a envoyé le message."
    )
    content = models.TextField(
        help_text="Le contenu textuel du message."
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="Date et heure d'enregistrement du message."
    )

    class Meta:
        ordering = ['timestamp']
        verbose_name = "Message de Chat"
        verbose_name_plural = "Messages de Chat"

    def __str__(self):
        return f"Message de {self.get_sender_display()} à {self.timestamp.strftime('%H:%M:%S')}"
```

### 📄 `backend\simulation\serializers.py`

```py
from rest_framework import serializers
from .models import SimulationSession, ChatMessage
from cases.serializers import ClinicalCaseListSerializer  # Pour afficher les détails du cas


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle ChatMessage.
    Utilisé pour afficher un message de chat.
    """

    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'content', 'timestamp']
        read_only_fields = ['id', 'session', 'sender', 'timestamp']  # L'utilisateur ne peut fournir que 'content'


class SimulationSessionSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour le modèle SimulationSession.
    Il inclut les détails du cas associé et les messages de la conversation.
    """
    # 'case' est un ForeignKey. Pour afficher plus que juste l'ID, on imbrique un autre serializer.
    case = ClinicalCaseListSerializer(read_only=True)

    # 'messages' est une relation inverse (related_name). On peut l'inclure aussi.
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SimulationSession
        fields = ['id', 'case', 'apprenant', 'status', 'start_time', 'end_time', 'messages']


class StartSimulationSerializer(serializers.Serializer):
    """
    Serializer spécialisé pour la validation des données lors de la création d'une session.
    Il ne correspond pas directement à un modèle, mais définit les champs attendus par l'API.
    """
    case_id = serializers.IntegerField(required=False, help_text="ID du cas. Si absent, un cas aléatoire est choisi.")
    force_new = serializers.BooleanField(required=False, default=False,
                                         help_text="Forcer la création d'une nouvelle session.")

    # On pourrait ajouter d'autres options ici plus tard, comme le niveau de difficulté souhaité.

    def validate_case_id(self, value):
        """
        Validation personnalisée pour s'assurer que le cas_id est valide et utilisable.
        """
        from cases.models import ClinicalCase
        try:
            case = ClinicalCase.objects.get(id=value, status=ClinicalCase.Status.APPROUVE)
        except ClinicalCase.DoesNotExist:
            raise serializers.ValidationError("Le cas clinique avec cet ID n'existe pas ou n'est pas approuvé.")
        return value
```

### 📄 `backend\simulation\tests.py`

```py
from django.test import TestCase

# Create your tests here.

```

### 📄 `backend\simulation\views.py`

```py
# backend/simulation/views.py
import random

from django.utils import timezone
from rest_framework import generics, status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from evaluation.agent.summarizer import SessionSummarizerAgent
from .models import SimulationSession, ChatMessage
from .serializers import ChatMessageSerializer, StartSimulationSerializer, SimulationSessionSerializer
from cases.models import ClinicalCase
from evaluation.agent.evaluator import TutorEvaluatorAgent
from evaluation.models import EvaluationLog
from evaluation.serializers import FinalReportSerializer
from .agent.simulator import PatientSimulatorAgent




class PostMessageView(generics.GenericAPIView):
    """
    Endpoint pour qu'un apprenant envoie un message dans une session
    et reçoive la réponse de l'IA.
    URL : /api/simulations/<int:session_id>/message/
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        session_id = self.kwargs.get('session_id')
        try:

            session = SimulationSession.objects.get(id=session_id, apprenant=request.user)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session non trouvée ou non autorisée."}, status=status.HTTP_404_NOT_FOUND)

        user_message_content = request.data.get('content')
        if not user_message_content:
            return Response({"error": "Le contenu du message est requis."}, status=status.HTTP_400_BAD_REQUEST)


        ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.APPRENANT,
            content=user_message_content
        )


        try:
            agent = PatientSimulatorAgent(case=session.case, session_id=session.id)
            ai_response_content = agent.generate_response(user_message=user_message_content)
        except Exception as e:
            return Response({"error": f"Erreur lors de la génération de la réponse de l'IA : {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        ai_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.PATIENT_IA,
            content=ai_response_content
        )

        # 4. Renvoyer la réponse de l'IA au frontend
        serializer = self.get_serializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class StartSimulationView(generics.CreateAPIView):
        """
        Endpoint pour démarrer une nouvelle session de simulation.
        Accepte un 'case_id' en POST et crée une session.
        URL: /api/simulations/start/
        """
        serializer_class = StartSimulationSerializer
        permission_classes = [IsAuthenticated]

        def create(self, request, *args, **kwargs):

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data
            case_id = validated_data['case_id']


            existing_session = SimulationSession.objects.filter(
                apprenant=request.user,
                case_id=case_id,
                status=SimulationSession.Status.IN_PROGRESS
            ).first()

            if existing_session:

                session_serializer = SimulationSessionSerializer(existing_session)
                return Response(session_serializer.data, status=status.HTTP_200_OK)


            case = ClinicalCase.objects.get(id=case_id)
            session = SimulationSession.objects.create(
                apprenant=request.user,
                case=case
            )

            #
            session_serializer = SimulationSessionSerializer(session)
            return Response(session_serializer.data, status=status.HTTP_201_CREATED)


class SimulationViewSet(mixins.CreateModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.ListModelMixin,
                        mixins.DestroyModelMixin, # <--- AJOUTER CE MIXIN (Permet le DELETE)
                        viewsets.GenericViewSet):
    """
    Un ViewSet pour gérer toutes les actions liées à une session de simulation.
    Regroupe les actions : lister, démarrer, consulter, et dialoguer.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Cette méthode garantit que toutes les opérations de ce ViewSet
        s'appliquent uniquement aux sessions de l'utilisateur actuellement connecté.
        """
        return SimulationSession.objects.filter(apprenant=self.request.user)

    def list(self, request):
        """
        Liste toutes les sessions de simulation de l'utilisateur connecté.
        Accessible via : GET /api/simulations/
        """
        queryset = self.get_queryset().order_by('-start_time')
        serializer = SimulationSessionSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Récupère les détails d'une session de simulation spécifique.
        Accessible via : GET /api/simulations/{pk}/
        """
        try:
            session = self.get_queryset().get(pk=pk)
            serializer = SimulationSessionSerializer(session)
            return Response(serializer.data)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session non trouvée ou non autorisée."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], serializer_class=StartSimulationSerializer, url_path='start')
    def start_session(self, request):
        """
        Démarre une nouvelle session de simulation pour un cas donné.
        Accessible via : POST /api/simulations/start/
        """
        serializer = StartSimulationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case_id = serializer.validated_data.get('case_id')
        force_new = serializer.validated_data.get('force_new', False)

        # LOGIQUE ALÉATOIRE
        if not case_id:
            # On cherche tous les IDs des cas approuvés
            approved_case_ids = list(ClinicalCase.objects.filter(status='approuve').values_list('id', flat=True))

            if not approved_case_ids:
                return Response({"error": "Aucun cas clinique disponible pour le moment."},
                                status=status.HTTP_404_NOT_FOUND)

            # On en choisit un au hasard
            case_id = random.choice(approved_case_ids)

        existing_session = SimulationSession.objects.filter(
            apprenant=request.user,
            case_id=case_id,
            status=SimulationSession.Status.IN_PROGRESS
        ).first()

        # 2. Si elle existe ET qu'on n'a pas forcé une nouvelle : on la renvoie (200 OK)
        if existing_session and not force_new:
            return Response(SimulationSessionSerializer(existing_session).data, status=status.HTTP_200_OK)

        # 3. Sinon (pas de session OU force_new=True), on crée une nouvelle (201 Created)
        new_session = SimulationSession.objects.create(
            apprenant=request.user,
            case_id=case_id,
            status=SimulationSession.Status.IN_PROGRESS
        )

        return Response(SimulationSessionSerializer(new_session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='finish')
    def finish_session(self, request, pk=None):
        print(f"--- DÉBUT CLÔTURE SESSION {pk} ---")
        try:
            session = self.get_queryset().get(pk=pk)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if session.status == SimulationSession.Status.COMPLETED and hasattr(session, 'report'):
            return Response({"report_id": session.report.id}, status=status.HTTP_200_OK)

        # 1. Clôture
        session.status = SimulationSession.Status.COMPLETED
        session.end_time = timezone.now()
        session.save()

        # 2. Génération rapport
        try:
            summarizer = SessionSummarizerAgent(session)
            report = summarizer.generate_report()
            print(f"--- RAPPORT GÉNÉRÉ. SCORE: {report.score_global} ---")

            # --- 3. MISE À JOUR DU PROFIL (KNOWLEDGE TRACING) ---
            user_profile = request.user.profile
            case_categories = session.case.categories.all()

            print(f"--- CATÉGORIES DU CAS : {[c.name for c in case_categories]} ---")

            if not case_categories:
                print("⚠️ ATTENTION : Ce cas n'a aucune catégorie ! Le profil ne sera pas mis à jour.")

            current_matrix = user_profile.skill_matrix or {}

            for category in case_categories:
                cat_name = category.name
                cat_data = current_matrix.get(cat_name, {"level": 0, "sessions": 0})

                # Calcul moyenne pondérée
                current_level = cat_data["level"]
                sessions_count = cat_data["sessions"]
                new_session_score = report.score_global

                new_level = ((current_level * sessions_count) + new_session_score) / (sessions_count + 1)

                current_matrix[cat_name] = {
                    "level": round(new_level, 1),
                    "sessions": sessions_count + 1
                }
                print(f"--- MISE À JOUR {cat_name} : {current_level} -> {new_level} ---")

            user_profile.skill_matrix = current_matrix
            user_profile.save()
            # ----------------------------------------------------

            return Response({"report_id": report.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"ERREUR CRITIQUE FINISH : {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": "Erreur serveur"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




    @action(detail=True, methods=['get'], url_path='results')
    def get_results(self, request, pk=None):
        """
        Récupère le rapport final d'une session terminée.
        URL : GET /api/simulations/{id}/results/
        """
        session = self.get_object()

        # Vérifier si un rapport existe
        if not hasattr(session, 'report'):
            return Response({"error": "Le rapport n'est pas encore généré pour cette session."},
                            status=status.HTTP_404_NOT_FOUND)

        # Sérialiser et renvoyer le rapport
        serializer = FinalReportSerializer(session.report)
        return Response(serializer.data)


    @action(detail=True, methods=['post'], serializer_class=ChatMessageSerializer, url_path='message')
    def post_message(self, request, pk=None):
        """
        Gère l'envoi d'un message par l'apprenant, la réponse du patient,
        et l'intervention éventuelle du tuteur socratique.
        """
        # 1. Récupération et vérification de la session
        try:
            session = self.get_queryset().get(pk=pk)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session non trouvée ou non autorisée."}, status=status.HTTP_404_NOT_FOUND)

        # 2. Validation du message utilisateur
        user_message_content = request.data.get('content')
        if not user_message_content:
            return Response({"error": "Le champ 'content' est requis."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Sauvegarde du message de l'apprenant
        user_message_obj = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.APPRENANT,
            content=user_message_content
        )

        # 4. Génération de la réponse du PATIENT (Agent Simulateur)
        try:
            agent = PatientSimulatorAgent(case=session.case, session_id=session.id)
            ai_response_content = agent.generate_response(user_message=user_message_content)
        except Exception as e:
            print(f"Erreur Agent Patient: {e}")
            return Response({"error": "Erreur lors de la génération de la réponse du patient."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        ai_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.PATIENT_IA,
            content=ai_response_content
        )

        # 5. Processus du TUTEUR (Agent Évaluateur)
        # Ce bloc est isolé dans un try/except pour ne jamais bloquer la conversation principale
        try:
            # A. Préparation du contexte pour l'évaluateur
            # On récupère l'historique jusqu'au message de l'utilisateur (sans la réponse du patient qui vient d'être créée)
            history_qs = ChatMessage.objects.filter(session=session).exclude(id=ai_message.id).order_by('timestamp')
            history_str = "\n".join([f"{m.get_sender_display()}: {m.content}" for m in history_qs])

            # Force le rechargement des données du cas (notamment key_questions)
            session.case.refresh_from_db()

            # B. Analyse par l'IA Tuteur
            evaluator = TutorEvaluatorAgent(case=session.case)
            eval_result = evaluator.evaluate_exchange(
                user_message=user_message_content,
                chat_history_str=history_str
            )

            if eval_result:
                # C. Sauvegarde du Log technique (pour les statistiques)
                EvaluationLog.objects.create(
                    message=user_message_obj,
                    relevance_score=eval_result.get('relevance_score', 5),
                    empathy_score=eval_result.get('empathy_score', 5),
                    reasoning=eval_result.get('reasoning', ''),
                    pedagogical_feedback=eval_result.get('pedagogical_feedback', '')
                )

                # D. Logique d'Intervention SOCRATIQUE
                # Si la pertinence est faible (< 6) ET qu'un feedback existe
                score = eval_result.get('relevance_score', 10)
                feedback = eval_result.get('pedagogical_feedback', '')

                if score < 6 and feedback:
                    # Le Tuteur intervient dans le chat avec une question guidante
                    ChatMessage.objects.create(
                        session=session,
                        sender=ChatMessage.Sender.TUTEUR,
                        content=f"🤔 Question du Mentor : {feedback}"
                    )
                    print(f"--- INTERVENTION DU TUTEUR : {feedback} ---")

        except Exception as e:

            print(f"⚠️ Erreur non bloquante dans le module tuteur : {e}")
            import traceback
            traceback.print_exc()

        response_serializer = ChatMessageSerializer(ai_message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
```

### 📄 `backend\users\__init__.py`

```py

```

### 📄 `backend\users\admin.py`

```py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profil'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_user_role')


    def get_user_role(self, instance):
        try:
            return instance.profile.get_role_display()
        except UserProfile.DoesNotExist:
            return "Pas de profil"
    get_user_role.short_description = 'Rôle'


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
```

### 📄 `backend\users\apps.py`

```py
from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

```

### 📄 `backend\users\models.py`

```py

from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    class Role(models.TextChoices):
        APPRENANT = 'APPRENANT', 'Apprenant'
        EXPERT = 'EXPERT', 'Expert'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.APPRENANT)

    skill_matrix = models.JSONField(
        default=dict,
        blank=True,
        help_text="Niveau de compétence par catégorie (Score moyen sur 100)"
    )

    #TODO Ajouter plus tard des attributs relatifs aux métriques d'évaluations

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.get_role_display()})"



@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
```

### 📄 `backend\users\serializers.py`

```py

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        user.set_password(validated_data['password'])
        user.save()
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)
        token['username'] = user.username

        try:
            token['role'] = user.profile.role
        except UserProfile.DoesNotExist:
            token['role'] = None

        return token


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer pour renvoyer les infos complètes de l'utilisateur connecté.
    """
    role = serializers.CharField(source='profile.role', read_only=True)
    skill_matrix = serializers.JSONField(source='profile.skill_matrix', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'skill_matrix']
```

### 📄 `backend\users\tests.py`

```py
from django.test import TestCase

# Create your tests here.

```

### 📄 `backend\users\views.py`

```py

from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserRegisterSerializer, MyTokenObtainPairSerializer, UserDetailSerializer


class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegisterSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserMeView(generics.RetrieveAPIView):
    """
    Endpoint pour récupérer les informations de l'utilisateur connecté.
    GET /api/users/me/
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
```

---

## 📚 Documentation

### 📄 `.venv\Lib\site-packages\django\contrib\admin\static\admin\css\vendor\select2\LICENSE-SELECT2.md`

The MIT License (MIT)

Copyright (c) 2012-2017 Kevin Brown, Igor Vaynberg, and Select2 contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


### 📄 `.venv\Lib\site-packages\django\contrib\admin\static\admin\js\vendor\select2\LICENSE.md`

The MIT License (MIT)

Copyright (c) 2012-2017 Kevin Brown, Igor Vaynberg, and Select2 contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


### 📄 `.venv\Lib\site-packages\djangorestframework-3.16.1.dist-info\licenses\LICENSE.md`

# License

Copyright © 2011-present, [Encode OSS Ltd](https://www.encode.io/).
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


### 📄 `.venv\Lib\site-packages\huggingface_hub\templates\datasetcard_template.md`

---
# For reference on dataset card metadata, see the spec: https://github.com/huggingface/hub-docs/blob/main/datasetcard.md?plain=1
# Doc / guide: https://huggingface.co/docs/hub/datasets-cards
{{ card_data }}
---

# Dataset Card for {{ pretty_name | default("Dataset Name", true) }}

<!-- Provide a quick summary of the dataset. -->

{{ dataset_summary | default("", true) }}

## Dataset Details

### Dataset Description

<!-- Provide a longer summary of what this dataset is. -->

{{ dataset_description | default("", true) }}

- **Curated by:** {{ curators | default("[More Information Needed]", true)}}
- **Funded by [optional]:** {{ funded_by | default("[More Information Needed]", true)}}
- **Shared by [optional]:** {{ shared_by | default("[More Information Needed]", true)}}
- **Language(s) (NLP):** {{ language | default("[More Information Needed]", true)}}
- **License:** {{ license | default("[More Information Needed]", true)}}

### Dataset Sources [optional]

<!-- Provide the basic links for the dataset. -->

- **Repository:** {{ repo | default("[More Information Needed]", true)}}
- **Paper [optional]:** {{ paper | default("[More Information Needed]", true)}}
- **Demo [optional]:** {{ demo | default("[More Information Needed]", true)}}

## Uses

<!-- Address questions around how the dataset is intended to be used. -->

### Direct Use

<!-- This section describes suitable use cases for the dataset. -->

{{ direct_use | default("[More Information Needed]", true)}}

### Out-of-Scope Use

<!-- This section addresses misuse, malicious use, and uses that the dataset will not work well for. -->

{{ out_of_scope_use | default("[More Information Needed]", true)}}

## Dataset Structure

<!-- This section provides a description of the dataset fields, and additional information about the dataset structure such as criteria used to create the splits, relationships between data points, etc. -->

{{ dataset_structure | default("[More Information Needed]", true)}}

## Dataset Creation

### Curation Rationale

<!-- Motivation for the creation of this dataset. -->

{{ curation_rationale_section | default("[More Information Needed]", true)}}

### Source Data

<!-- This section describes the source data (e.g. news text and headlines, social media posts, translated sentences, ...). -->

#### Data Collection and Processing

<!-- This section describes the data collection and processing process such as data selection criteria, filtering and normalization methods, tools and libraries used, etc. -->

{{ data_collection_and_processing_section | default("[More Information Needed]", true)}}

#### Who are the source data producers?

<!-- This section describes the people or systems who originally created the data. It should also include self-reported demographic or identity information for the source data creators if this information is available. -->

{{ source_data_producers_section | default("[More Information Needed]", true)}}

### Annotations [optional]

<!-- If the dataset contains annotations which are not part of the initial data collection, use this section to describe them. -->

#### Annotation process

<!-- This section describes the annotation process such as annotation tools used in the process, the amount of data annotated, annotation guidelines provided to the annotators, interannotator statistics, annotation validation, etc. -->

{{ annotation_process_section | default("[More Information Needed]", true)}}

#### Who are the annotators?

<!-- This section describes the people or systems who created the annotations. -->

{{ who_are_annotators_section | default("[More Information Needed]", true)}}

#### Personal and Sensitive Information

<!-- State whether the dataset contains data that might be considered personal, sensitive, or private (e.g., data that reveals addresses, uniquely identifiable names or aliases, racial or ethnic origins, sexual orientations, religious beliefs, political opinions, financial or health data, etc.). If efforts were made to anonymize the data, describe the anonymization process. -->

{{ personal_and_sensitive_information | default("[More Information Needed]", true)}}

## Bias, Risks, and Limitations

<!-- This section is meant to convey both technical and sociotechnical limitations. -->

{{ bias_risks_limitations | default("[More Information Needed]", true)}}

### Recommendations

<!-- This section is meant to convey recommendations with respect to the bias, risk, and technical limitations. -->

{{ bias_recommendations | default("Users should be made aware of the risks, biases and limitations of the dataset. More information needed for further recommendations.", true)}}

## Citation [optional]

<!-- If there is a paper or blog post introducing the dataset, the APA and Bibtex information for that should go in this section. -->

**BibTeX:**

{{ citation_bibtex | default("[More Information Needed]", true)}}

**APA:**

{{ citation_apa | default("[More Information Needed]", true)}}

## Glossary [optional]

<!-- If relevant, include terms and calculations in this section that can help readers understand the dataset or dataset card. -->

{{ glossary | default("[More Information Needed]", true)}}

## More Information [optional]

{{ more_information | default("[More Information Needed]", true)}}

## Dataset Card Authors [optional]

{{ dataset_card_authors | default("[More Information Needed]", true)}}

## Dataset Card Contact

{{ dataset_card_contact | default("[More Information Needed]", true)}}


### 📄 `.venv\Lib\site-packages\huggingface_hub\templates\modelcard_template.md`

---
# For reference on model card metadata, see the spec: https://github.com/huggingface/hub-docs/blob/main/modelcard.md?plain=1
# Doc / guide: https://huggingface.co/docs/hub/model-cards
{{ card_data }}
---

# Model Card for {{ model_id | default("Model ID", true) }}

<!-- Provide a quick summary of what the model is/does. -->

{{ model_summary | default("", true) }}

## Model Details

### Model Description

<!-- Provide a longer summary of what this model is. -->

{{ model_description | default("", true) }}

- **Developed by:** {{ developers | default("[More Information Needed]", true)}}
- **Funded by [optional]:** {{ funded_by | default("[More Information Needed]", true)}}
- **Shared by [optional]:** {{ shared_by | default("[More Information Needed]", true)}}
- **Model type:** {{ model_type | default("[More Information Needed]", true)}}
- **Language(s) (NLP):** {{ language | default("[More Information Needed]", true)}}
- **License:** {{ license | default("[More Information Needed]", true)}}
- **Finetuned from model [optional]:** {{ base_model | default("[More Information Needed]", true)}}

### Model Sources [optional]

<!-- Provide the basic links for the model. -->

- **Repository:** {{ repo | default("[More Information Needed]", true)}}
- **Paper [optional]:** {{ paper | default("[More Information Needed]", true)}}
- **Demo [optional]:** {{ demo | default("[More Information Needed]", true)}}

## Uses

<!-- Address questions around how the model is intended to be used, including the foreseeable users of the model and those affected by the model. -->

### Direct Use

<!-- This section is for the model use without fine-tuning or plugging into a larger ecosystem/app. -->

{{ direct_use | default("[More Information Needed]", true)}}

### Downstream Use [optional]

<!-- This section is for the model use when fine-tuned for a task, or when plugged into a larger ecosystem/app -->

{{ downstream_use | default("[More Information Needed]", true)}}

### Out-of-Scope Use

<!-- This section addresses misuse, malicious use, and uses that the model will not work well for. -->

{{ out_of_scope_use | default("[More Information Needed]", true)}}

## Bias, Risks, and Limitations

<!-- This section is meant to convey both technical and sociotechnical limitations. -->

{{ bias_risks_limitations | default("[More Information Needed]", true)}}

### Recommendations

<!-- This section is meant to convey recommendations with respect to the bias, risk, and technical limitations. -->

{{ bias_recommendations | default("Users (both direct and downstream) should be made aware of the risks, biases and limitations of the model. More information needed for further recommendations.", true)}}

## How to Get Started with the Model

Use the code below to get started with the model.

{{ get_started_code | default("[More Information Needed]", true)}}

## Training Details

### Training Data

<!-- This should link to a Dataset Card, perhaps with a short stub of information on what the training data is all about as well as documentation related to data pre-processing or additional filtering. -->

{{ training_data | default("[More Information Needed]", true)}}

### Training Procedure

<!-- This relates heavily to the Technical Specifications. Content here should link to that section when it is relevant to the training procedure. -->

#### Preprocessing [optional]

{{ preprocessing | default("[More Information Needed]", true)}}


#### Training Hyperparameters

- **Training regime:** {{ training_regime | default("[More Information Needed]", true)}} <!--fp32, fp16 mixed precision, bf16 mixed precision, bf16 non-mixed precision, fp16 non-mixed precision, fp8 mixed precision -->

#### Speeds, Sizes, Times [optional]

<!-- This section provides information about throughput, start/end time, checkpoint size if relevant, etc. -->

{{ speeds_sizes_times | default("[More Information Needed]", true)}}

## Evaluation

<!-- This section describes the evaluation protocols and provides the results. -->

### Testing Data, Factors & Metrics

#### Testing Data

<!-- This should link to a Dataset Card if possible. -->

{{ testing_data | default("[More Information Needed]", true)}}

#### Factors

<!-- These are the things the evaluation is disaggregating by, e.g., subpopulations or domains. -->

{{ testing_factors | default("[More Information Needed]", true)}}

#### Metrics

<!-- These are the evaluation metrics being used, ideally with a description of why. -->

{{ testing_metrics | default("[More Information Needed]", true)}}

### Results

{{ results | default("[More Information Needed]", true)}}

#### Summary

{{ results_summary | default("", true) }}

## Model Examination [optional]

<!-- Relevant interpretability work for the model goes here -->

{{ model_examination | default("[More Information Needed]", true)}}

## Environmental Impact

<!-- Total emissions (in grams of CO2eq) and additional considerations, such as electricity usage, go here. Edit the suggested text below accordingly -->

Carbon emissions can be estimated using the [Machine Learning Impact calculator](https://mlco2.github.io/impact#compute) presented in [Lacoste et al. (2019)](https://arxiv.org/abs/1910.09700).

- **Hardware Type:** {{ hardware_type | default("[More Information Needed]", true)}}
- **Hours used:** {{ hours_used | default("[More Information Needed]", true)}}
- **Cloud Provider:** {{ cloud_provider | default("[More Information Needed]", true)}}
- **Compute Region:** {{ cloud_region | default("[More Information Needed]", true)}}
- **Carbon Emitted:** {{ co2_emitted | default("[More Information Needed]", true)}}

## Technical Specifications [optional]

### Model Architecture and Objective

{{ model_specs | default("[More Information Needed]", true)}}

### Compute Infrastructure

{{ compute_infrastructure | default("[More Information Needed]", true)}}

#### Hardware

{{ hardware_requirements | default("[More Information Needed]", true)}}

#### Software

{{ software | default("[More Information Needed]", true)}}

## Citation [optional]

<!-- If there is a paper or blog post introducing the model, the APA and Bibtex information for that should go in this section. -->

**BibTeX:**

{{ citation_bibtex | default("[More Information Needed]", true)}}

**APA:**

{{ citation_apa | default("[More Information Needed]", true)}}

## Glossary [optional]

<!-- If relevant, include terms and calculations in this section that can help readers understand the model or model card. -->

{{ glossary | default("[More Information Needed]", true)}}

## More Information [optional]

{{ more_information | default("[More Information Needed]", true)}}

## Model Card Authors [optional]

{{ model_card_authors | default("[More Information Needed]", true)}}

## Model Card Contact

{{ model_card_contact | default("[More Information Needed]", true)}}


### 📄 `.venv\Lib\site-packages\idna-3.11.dist-info\licenses\LICENSE.md`

BSD 3-Clause License

Copyright (c) 2013-2025, Kim Davies and contributors.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


### 📄 `.venv\Lib\site-packages\pip-25.2.dist-info\licenses\src\pip\_vendor\idna\LICENSE.md`

BSD 3-Clause License

Copyright (c) 2013-2024, Kim Davies and contributors.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


---

## 🤖 Guide d'Utilisation pour l'IA

### Contexte du Projet

Ce projet est une plateforme éducative médicale utilisant l'IA générative.

**Stack Technique:**
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, Redux Toolkit
- **Backend:** Django 5.2, Django REST Framework, PostgreSQL
- **IA:** Intégration avec Groq, LangChain, Mistral

### Points d'Attention

1. Architecture full-stack séparée (frontend/backend)
2. Authentification JWT
3. Simulations médicales interactives
4. Système d'évaluation par IA
5. Interface expert pour validation de cas

